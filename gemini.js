// gemini.js
// Använd den globala GoogleGenerativeAI från window-objektet
import { getCurrentApiKey } from './config.js';

// Global variables to store AI clients for each key
let genAI1 = null;
let genAI2 = null;
let lastUsedKey = null;

// Initialize or get the appropriate Gemini client
async function getGeminiClient() {
  const currentKey = await getCurrentApiKey();
  if (!currentKey) return null;
  
  // If this is the same key as before, return existing client
  if (currentKey === lastUsedKey && (genAI1 || genAI2)) {
    return currentKey === lastUsedKey ? (genAI1 || genAI2) : null;
  }
  
  // Create new client for the current key
  const newClient = new window.GoogleGenerativeAI(currentKey);
  
  // Store client based on key rotation pattern
  // (This is a simple approach - in practice both keys would have separate clients)
  if (!genAI1) {
    genAI1 = newClient;
  } else if (!genAI2 && currentKey !== lastUsedKey) {
    genAI2 = newClient;
  }
  
  lastUsedKey = currentKey;
  return newClient;
}

/**
 * Fråga Gemini AI och returnera svaret som text
 * @param {string} prompt - Prompten du vill skicka till AI
 * @returns {Promise<string>} - AI:s svar som text
 */
export async function askGemini(prompt) {
  try {
    // Get the appropriate Gemini client for current rotation
    const client = await getGeminiClient();
    if (!client) {
      return 'Sorry, I encountered an error.';
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