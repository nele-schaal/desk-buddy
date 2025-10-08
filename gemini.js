// gemini.js
// Använd den globala GoogleGenerativeAI från window-objektet
<<<<<<< HEAD

// Din API-nyckel från AI Studio
const API_KEY = 'AIzaSyA4d8JVWX1xyqaONMw_0XYQshEHNTkIKxs';

// Initiera klienten
const genAI = new window.GoogleGenerativeAI(API_KEY);
=======
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
>>>>>>> parent of 8708f72 (Implement dual API key rotation system and update gemini client initialization)

/**
 * Fråga Gemini AI och returnera svaret som text
 * @param {string} prompt - Prompten du vill skicka till AI
 * @returns {Promise<string>} - AI:s svar som text
 */
export async function askGemini(prompt) {
  try {
<<<<<<< HEAD
=======
    // Initialize Gemini client if not already done
    const client = await initializeGemini();
    if (!client) {
      return 'API key not available';
    }

>>>>>>> parent of 8708f72 (Implement dual API key rotation system and update gemini client initialization)
    // Välj en modell som finns: gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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