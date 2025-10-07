// config.js - Automatic dual API key rotation system

// Global state for key rotation
let apiKeys = { key1: null, key2: null };
let rotationStartTime = null;
let isInitialized = false;

// Load both API keys from environment file
async function loadApiKeys() {
  try {
    const response = await fetch('./apiHide.env');
    const envText = await response.text();
    const lines = envText.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('GEMINI_API_KEY=')) {
        apiKeys.key1 = line.split('=')[1].trim();
      } else if (line.startsWith('GEMINI_API_KEY_2=')) {
        const key2 = line.split('=')[1].trim();
        // Only use key2 if it's not the placeholder
        if (key2 !== 'PLACEHOLDER_FOR_SECOND_KEY') {
          apiKeys.key2 = key2;
        }
      }
    }
    
    if (!apiKeys.key1) {
      throw new Error('GEMINI_API_KEY not found in apiHide.env');
    }
    
    // Initialize rotation timer
    rotationStartTime = Date.now();
    isInitialized = true;
    
    console.log('🔑 API Keys loaded:', {
      key1: apiKeys.key1 ? '✅ Available' : '❌ Missing',
      key2: apiKeys.key2 ? '✅ Available' : '❌ Using single key mode'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Could not load API keys from apiHide.env:', error);
    return false;
  }
}

// Get currently active API key based on 60-second rotation
export async function getCurrentApiKey() {
  // Initialize if not done yet
  if (!isInitialized) {
    const loaded = await loadApiKeys();
    if (!loaded) return null;
  }
  
  // If only one key available, always use it
  if (!apiKeys.key2) {
    return apiKeys.key1;
  }
  
  // Calculate which key should be active (60-second rotation)
  const elapsed = Date.now() - rotationStartTime;
  const minutesPassed = Math.floor(elapsed / 60000); // 60000ms = 1 minute
  const isEvenMinute = minutesPassed % 2 === 0;
  
  // Even minutes: key1, Odd minutes: key2
  return isEvenMinute ? apiKeys.key1 : apiKeys.key2;
}

// Get rotation info for debugging (optional)
export function getRotationInfo() {
  if (!isInitialized) return null;
  
  const elapsed = Date.now() - rotationStartTime;
  const secondsInCurrentMinute = Math.floor((elapsed % 60000) / 1000);
  const minutesPassed = Math.floor(elapsed / 60000);
  const activeKey = minutesPassed % 2 === 0 ? 'Key 1' : 'Key 2';
  const secondsUntilSwitch = 60 - secondsInCurrentMinute;
  
  return {
    activeKey,
    secondsUntilSwitch,
    dualKeyMode: !!apiKeys.key2
  };
}