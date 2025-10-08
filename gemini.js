// gemini.js
// Använd den globala GoogleGenerativeAI från window-objektet

// Din API-nyckel från AI Studio
const API_KEY = 'AIzaSyA4d8JVWX1xyqaONMw_0XYQshEHNTkIKxs';

// Initiera klienten
const genAI = new window.GoogleGenerativeAI(API_KEY);

/**
 * Fråga Gemini AI och returnera svaret som text
 * @param {string} prompt - Prompten du vill skicka till AI
 * @returns {Promise<string>} - AI:s svar som text
 */
export async function askGemini(prompt) {
  try {
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