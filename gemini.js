// gemini.js
// Använd den globala GoogleGenerativeAI från window-objektet
import { getApiKey } from './config.js';

// Global variable to store the AI client
let genAI = null;

// Initialize the client with API key from env file
async function initializeGemini() {
  if (!genAI) {
    const API_KEY = await getApiKey();
    if (API_KEY) {
      genAI = new window.GoogleGenerativeAI(API_KEY);
    }
  }
  return genAI;
}

/**
 * Fråga Gemini AI och returnera svaret som text
 * @param {string} prompt - Prompten du vill skicka till AI
 * @returns {Promise<string>} - AI:s svar som text
 */
export async function askGemini(prompt) {
  try {
    // Initialize Gemini client if not already done
    const client = await initializeGemini();
    if (!client) {
      return 'API key not available';
    }

    // Välj en modell som finns: gemini-2.5-flash
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Skicka prompten till modellen
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    });

    // Hämta svaret som text
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Error calling Gemini:', error);
    return 'Sorry, I encountered an error.';
  }
}