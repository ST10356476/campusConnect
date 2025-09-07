require("dotenv").config();
const fetch = require("node-fetch");

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

if (!API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY is not defined in the .env file.");
  process.exit(1);
}

async function generateFromGemini(prompt) {
  try {
    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Extract the text from Gemini response
    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No text returned";

    return generatedText;
  } catch (err) {
    console.error("❌ Gemini API error:", err.message);
    throw err;
  }
}

module.exports = { generateFromGemini };
