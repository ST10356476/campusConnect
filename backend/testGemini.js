// First, make sure you have the 'dotenv' package installed: npm install dotenv
// Then, you need to create a .env file in the same directory with your API key:
// GEMINI_API_KEY=your_api_key_here

require('dotenv').config();

// The API key is now available in process.env
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY is not defined in the .env file.');
  process.exit(1);
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// The payload for the API request
const payload = {
  contents: [
    {
      parts: [
        {
          text: "Write a short, whimsical story about a squirrel who finds a magical acorn."
        }
      ]
    }
  ]
};

// Function to call the Gemini API
async function generateContent() {
  try {
  // Calling Gemini API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
  // Generated Content
  // Output generated text

  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

// Run the function
generateContent();
