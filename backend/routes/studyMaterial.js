// routes/studyMaterial.js
require("dotenv").config();
const express = require("express");
const upload = require("../src/middleware/upload");
const StudyMaterial = require("../src/models/StudyMaterial");
const cloudinary = require("../src/config/cloudinary");
const mammoth = require("mammoth"); // 👈 for reading .docx

const router = express.Router();

// -------------------- ENV & CONFIG --------------------
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

if (!API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY is not defined in the .env file.");
  process.exit(1);
}

// -------------------- Upload Study Material --------------------
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileData = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      "base64"
    )}`;
    const uploadRes = await cloudinary.uploader.upload(fileData, {
      folder: "study_materials",
      resource_type: "auto",
    });

    const material = new StudyMaterial({
      filename: uploadRes.public_id,
      originalName: req.file.originalname,
      url: uploadRes.secure_url,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      flashcards: [],
      summary: "",
      quiz: [],
    });

    await material.save();
    res.status(201).json({ success: true, material });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "File upload failed", details: err.message });
  }
});

// -------------------- Generate Summary / Flashcards / Quiz --------------------
// -------------------- Generate Summary / Flashcards / Quiz --------------------
router.post("/:id/generate", async (req, res) => {
  try {
    console.log("📩 Generation request received");
    const { type } = req.body;
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) return res.status(404).json({ error: "Material not found" });
    if (!material.url) return res.status(400).json({ error: "Material URL missing" });

    // -------------------- Extract text from Word doc --------------------
    let extractedText = "";
    if (material.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const response = await fetch(material.url);
      const buffer = Buffer.from(await response.arrayBuffer());

      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value.trim();
    } else {
      extractedText = `Document is not a .docx file. (type: ${material.fileType})`;
    }

    if (!extractedText) {
      return res.status(400).json({ error: "Could not extract text from document" });
    }

    // -------------------- Build prompt --------------------
    let prompt = "";
    if (type === "summary") {
      prompt = `
Summarize the following text in clear, concise bullet points.
Return ONLY bullet points (no intro, no explanation).
---
${extractedText}
`;
    } else if (type === "flashcards") {
      prompt = `
You are a flashcard generator.
Return ONLY a valid JSON array.
Each item must have: "question" (string) and "answer" (string).
No markdown, no commentary, no extra keys.
Generate 10 flashcards from this text:
---
${extractedText}
`;
    } else if (type === "quiz") {
      prompt = `
You are a quiz generator.
Return ONLY a valid JSON array.
Each item must have: "question" (string), "options" (array of 4 strings), and "answer" (string).
No markdown, no commentary, no extra keys.
Generate 5 multiple-choice questions from this text:
---
${extractedText}
`;
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    // -------------------- Call Gemini --------------------
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API failed with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // -------------------- Cleanup for JSON --------------------
    let parsed = null;
    if (type === "flashcards" || type === "quiz") {
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/```json|```/g, "");
      }
      try {
        parsed = JSON.parse(cleanText);
      } catch {
        console.warn("⚠️ JSON parse failed, saving raw text");
      }
    }

    // -------------------- Save result --------------------
    if (type === "summary") {
      material.summary = text;
    } else if (type === "flashcards") {
      material.flashcards = parsed || [{ question: "Parsing failed", answer: text }];
    } else if (type === "quiz") {
      material.quiz = parsed || [{ question: "Parsing failed", options: [], answer: text }];
    }

    await material.save();
    res.json({ success: true, material });
  } catch (err) {
    console.error("❌ Generation error:", err.message);
    res.status(500).json({ error: "Generation failed", details: err.message });
  }
});
module.exports = router;

