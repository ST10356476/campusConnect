require("dotenv").config();
const express = require("express");
const upload = require("../src/middleware/upload");
const StudyMaterial = require("../src/models/StudyMaterial");
const cloudinary = require("../src/config/cloudinary");
const mammoth = require("mammoth");
const https = require("https");
const http = require("http");
const { protect } = require("../src/middleware/auth"); 
const pdfParse = require("pdf-parse");

const router = express.Router();

// -------------------- ENV & CONFIG --------------------
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.0-flash-exp";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

if (!API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY");
  process.exit(1);
}

// -------------------- HTTP Fetch Function --------------------
const fetchFile = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

// -------------------- Gemini API Fetch Function --------------------
const callGeminiAPI = (payload) => {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Gemini API failed with ${res.statusCode}: ${data}`));
          return;
        }
        
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (parseError) {
          reject(new Error(`Failed to parse Gemini response: ${parseError.message}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// -------------------- Text Extraction Functions --------------------
const extractTextFromBuffer = async (buffer, fileType) => {
  let extractedText = "";
  
  try {
    switch (fileType) {
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        // DOCX files
        const docxResult = await mammoth.extractRawText({ buffer });
        extractedText = docxResult.value.trim();
        break;
        
      case "application/msword":
        // DOC files
        const docResult = await mammoth.extractRawText({ buffer });
        extractedText = docResult.value.trim();
        break;
        
      case "application/pdf":
        // PDF files - Enhanced PDF parsing
  // Processing PDF file, buffer size
        try {
          const pdfResult = await pdfParse(buffer, {
            // PDF parsing options for better text extraction
            normalizeWhitespace: false,
            disableCombineTextItems: false
          });
          extractedText = pdfResult.text.trim();
          // PDF text extracted successfully
          
          // If no text was extracted, try alternative approach
          if (!extractedText || extractedText.length < 10) {
            // PDF text extraction yielded minimal results, trying alternative
            const altResult = await pdfParse(buffer, { 
              pagerender: null // Try without page rendering
            });
            extractedText = altResult.text.trim();
          }
        } catch (pdfError) {
          console.error("❌ PDF parsing error:", pdfError.message);
          throw new Error("Failed to extract text from PDF. The PDF might be image-based or corrupted.");
        }
        break;
        
      case "text/plain":
        // Plain text files
        extractedText = buffer.toString('utf-8').trim();
        break;
        
      case "application/rtf":
      case "text/rtf":
        // RTF files - basic extraction
        extractedText = buffer.toString('utf-8')
          .replace(/\\[a-z]+[0-9]*\s?/gi, '') // Remove RTF control words
          .replace(/[{}]/g, '') // Remove braces
          .trim();
        break;
        
      case "text/markdown":
        // Markdown files
        extractedText = buffer.toString('utf-8')
          .replace(/[#*_`~\[\]]/g, '') // Remove basic markdown formatting
          .trim();
        break;
        
      default:
        // For other text-based formats, try to extract as plain text
        if (fileType.startsWith('text/')) {
          extractedText = buffer.toString('utf-8').trim();
        } else {
          throw new Error(`Unsupported file type: ${fileType}`);
        }
    }
    
    console.log(`📊 Final extracted text length for ${fileType}:`, extractedText.length);
    return extractedText;
  } catch (error) {
    console.error(`Text extraction failed for ${fileType}:`, error.message);
    throw new Error(`Failed to extract text from ${fileType.split('/').pop()?.toUpperCase()} file: ${error.message}`);
  }
};

// -------------------- GET All Study Materials --------------------
router.get("/", async (req, res) => {
  try {
    const materials = await StudyMaterial.find({})
      .populate('uploadedBy', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    console.error("Fetch materials error:", err.message);
    res.status(500).json({ error: "Failed to fetch materials", details: err.message });
  }
});

// -------------------- GET Single Study Material --------------------
router.get("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id)
      .populate('uploadedBy', 'username profile.firstName profile.lastName');
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.json(material);
  } catch (err) {
    console.error("Fetch material error:", err.message);
    res.status(500).json({ error: "Failed to fetch material", details: err.message });
  }
});

// -------------------- Upload Study Material --------------------
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Validate file type - now supporting more types
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf',
      'text/rtf',
      'text/markdown',
      'application/vnd.oasis.opendocument.text'
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: "Unsupported file type. Supported formats: PDF, DOCX, DOC, TXT, RTF, Markdown, ODT" 
      });
    }

    console.log("📤 Uploading file:", req.file.originalname, "by user:", req.user.id);

    const fileData = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    
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
      uploadedBy: req.user.id,
      savedBy: [],
      flashcards: [],
      summary: "",
      quiz: [],
    });

    await material.save();
    
    // Populate the uploadedBy field before sending response
    await material.populate('uploadedBy', 'username profile.firstName profile.lastName');
    
    console.log("✅ Material saved:", material._id);
    
    res.status(201).json({ success: true, material });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "File upload failed", details: err.message });
  }
});

// -------------------- Generate Summary / Flashcards / Quiz --------------------
router.post("/:id/generate", protect, async (req, res) => {
  try {
    console.log("📩 Generation request received for:", req.params.id, "Type:", req.body.type);
    
    const { type } = req.body;
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) return res.status(404).json({ error: "Material not found" });
    if (!material.url) return res.status(400).json({ error: "Material URL missing" });

    // -------------------- Extract text from document --------------------
    let extractedText = "";
    
    try {
      console.log("📖 Extracting text from", material.fileType, "file");
      const buffer = await fetchFile(material.url);
      
      extractedText = await extractTextFromBuffer(buffer, material.fileType);
      console.log("✅ Text extracted, length:", extractedText.length);
    } catch (extractError) {
      console.error("❌ Text extraction failed:", extractError.message);
      return res.status(400).json({ error: extractError.message });
    }

    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({ error: "Could not extract sufficient text from document" });
    }

    // Limit text length to avoid API limits
    if (extractedText.length > 10000) {
      extractedText = extractedText.substring(0, 10000) + "...";
      console.log("⚠️ Text truncated to 10,000 characters");
    }

    // -------------------- Build prompt --------------------
    let prompt = "";
    if (type === "summary") {
      prompt = `Please create a clear, well-structured summary of the following text. Format it as bullet points covering the main topics and key concepts:

${extractedText}

Please provide only the bullet points summary, no additional text or formatting.`;
    } else if (type === "flashcards") {
      prompt = `Create exactly 10 flashcards from the following text. Return ONLY a valid JSON array where each item has "question" and "answer" fields. Make sure the questions test understanding of key concepts.

Text:
${extractedText}

Return only the JSON array, no markdown formatting or explanations.`;
    } else if (type === "quiz") {
      prompt = `Create exactly 5 multiple-choice questions from the following text. Return ONLY a valid JSON array where each item has:
- "question": the question text
- "options": array of exactly 4 answer choices  
- "answer": the correct answer (must match one of the options exactly)

Text:
${extractedText}

Return only the JSON array, no markdown formatting or explanations.`;
    } else {
      return res.status(400).json({ error: "Invalid type. Must be 'summary', 'flashcards', or 'quiz'" });
    }

    // -------------------- Call Gemini --------------------
    console.log("🤖 Calling Gemini API...");
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const data = await callGeminiAPI(payload);
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!text) {
      throw new Error("No content returned from Gemini API");
    }

    console.log("✅ Gemini response received, length:", text.length);

    // -------------------- Process response --------------------
    let parsed = null;
    if (type === "flashcards" || type === "quiz") {
      let cleanText = text.trim();
      
      // Remove markdown formatting if present
      if (cleanText.includes("```")) {
        cleanText = cleanText.replace(/```json|```/g, "").trim();
      }
      
      try {
        parsed = JSON.parse(cleanText);
        console.log("✅ JSON parsed successfully, items:", parsed.length);
        
        // Validate structure
        if (type === "flashcards") {
          parsed = parsed.filter(item => item.question && item.answer);
        } else if (type === "quiz") {
          parsed = parsed.filter(item => 
            item.question && 
            item.options && 
            Array.isArray(item.options) && 
            item.options.length === 4 && 
            item.answer
          );
        }
      } catch (parseError) {
        console.warn("⚠️ JSON parse failed:", parseError.message);
        parsed = null;
      }
    }

    // -------------------- Save result --------------------
    if (type === "summary") {
      material.summary = text;
    } else if (type === "flashcards") {
      material.flashcards = parsed || [{ question: "Generation failed", answer: "Please try again" }];
    } else if (type === "quiz") {
      material.quiz = parsed || [{ 
        question: "Generation failed", 
        options: ["Please", "Try", "Again", "Later"], 
        answer: "Please" 
      }];
    }

    await material.save();
    
    // Populate before sending response
    await material.populate('uploadedBy', 'username profile.firstName profile.lastName');
    
    console.log("✅ Material updated and saved");
    
    res.json({ success: true, material });
  } catch (err) {
    console.error("❌ Generation error:", err.message);
    res.status(500).json({ error: "Generation failed", details: err.message });
  }
});

// -------------------- Save Material --------------------
router.post("/:id/save", protect, async (req, res) => {
  try {
    console.log("🔍 Save request - Material ID:", req.params.id, "User ID:", req.user.id);
    
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    console.log("📋 Current savedBy array:", material.savedBy);
    console.log("🔍 User ID type:", typeof req.user.id, "Value:", req.user.id);

    // Check if already saved
    const isAlreadySaved = material.savedBy.some(userId => userId.toString() === req.user.id.toString());
    if (isAlreadySaved) {
      console.log("⚠️ Material already saved by user");
      return res.status(400).json({ error: "Material already saved" });
    }

    // Add user to savedBy array
    material.savedBy.push(req.user.id);
    await material.save();
    
    console.log("✅ Updated savedBy array:", material.savedBy);
    
    // Populate before sending response
    await material.populate('uploadedBy', 'username profile.firstName profile.lastName');
    
    console.log("✅ Material saved by user:", req.user.id, "Material ID:", material._id);
    res.json({ success: true, material });
  } catch (err) {
    console.error("Save error:", err.message);
    res.status(500).json({ error: "Failed to save material", details: err.message });
  }
});

// -------------------- Unsave Material --------------------
router.delete("/:id/save", protect, async (req, res) => {
  try {
    console.log("🔍 Unsave request - Material ID:", req.params.id, "User ID:", req.user.id);
    
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    console.log("📋 Current savedBy array before unsave:", material.savedBy);

    // Remove user from savedBy array
    const originalLength = material.savedBy.length;
    material.savedBy = material.savedBy.filter(userId => userId.toString() !== req.user.id.toString());
    
    console.log("📋 Filtered savedBy array:", material.savedBy);
    console.log("📊 Array length changed from", originalLength, "to", material.savedBy.length);
    
    await material.save();
    
    // Populate before sending response
    await material.populate('uploadedBy', 'username profile.firstName profile.lastName');
    
    console.log("✅ Material unsaved by user:", req.user.id, "Material ID:", material._id);
    res.json({ success: true, material });
  } catch (err) {
    console.error("Unsave error:", err.message);
    res.status(500).json({ error: "Failed to unsave material", details: err.message });
  }
});

// -------------------- Delete Study Material --------------------
router.delete("/:id", protect, async (req, res) => {
  try {
    console.log("🔍 Delete request - Material ID:", req.params.id, "User ID:", req.user.id);
    
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    console.log("🔍 Delete authorization check:");
    console.log("  - Material uploadedBy:", material.uploadedBy);
    console.log("  - Material uploadedBy type:", typeof material.uploadedBy);
    console.log("  - Current user ID:", req.user.id);
    console.log("  - Current user ID type:", typeof req.user.id);

    // Check if user is the owner - Convert both to strings for comparison
    const materialOwnerId = material.uploadedBy ? material.uploadedBy.toString() : null;
    const currentUserId = req.user.id ? req.user.id.toString() : null;

    console.log("🔍 String comparison:");
    console.log("  - Material owner ID (string):", materialOwnerId);
    console.log("  - Current user ID (string):", currentUserId);
    console.log("  - Are they equal?", materialOwnerId === currentUserId);

    if (!materialOwnerId || materialOwnerId !== currentUserId) {
      console.log("❌ Authorization failed - User cannot delete this material");
      return res.status(403).json({ error: "You can only delete materials you uploaded" });
    }

    // Delete from cloudinary if needed
    if (material.filename) {
      try {
        await cloudinary.uploader.destroy(material.filename);
        console.log("✅ Cloudinary file deleted:", material.filename);
      } catch (cloudinaryError) {
        console.warn("⚠️ Cloudinary deletion failed:", cloudinaryError.message);
      }
    }

    await StudyMaterial.findByIdAndDelete(req.params.id);
    console.log("✅ Material deleted successfully:", req.params.id);
    
    res.json({ success: true, message: "Material deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: "Failed to delete material", details: err.message });
  }
});

module.exports = router;