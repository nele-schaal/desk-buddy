// test.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Din API-nyckel från AI Studio
const API_KEY = "AIzaSyA4d8JVWX1xyqaONMw_0XYQshEHNTkIKxs";

async function testGemini() {
  const ai = new GoogleGenerativeAI(API_KEY);

  // 🔹 Välj en modell som finns: gemini-2.0-turbo
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent(
      "Skriv en kort rolig mening om kaffe och robotar."
    );
    console.log("✅ Svar från Gemini API:");
    console.log(result.response.text());
  } catch (err) {
    console.error("❌ Fel vid anrop till Gemini API:", err);
  }
}

testGemini();