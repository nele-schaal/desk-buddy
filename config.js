// config.js - Load API key from environment file

// Simple function to load API key from your apiHide.env file
export async function getApiKey() {
  try {
    // Fetch the environment file
    const response = await fetch('./apiHide.env');
    const envText = await response.text();
    
    // Parse the GEMINI_API_KEY line
    const lines = envText.split('\n');
    for (const line of lines) {
      if (line.startsWith('GEMINI_API_KEY=')) {
        return line.split('=')[1].trim();
      }
    }
    
    throw new Error('GEMINI_API_KEY not found in apiHide.env');
  } catch (error) {
    console.error('❌ Could not load API key from apiHide.env:', error);
    return null;
  }
}