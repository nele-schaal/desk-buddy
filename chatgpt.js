import OpenAI from 'https://cdn.skypack.dev/openai';

// Replace with your actual API key
const openai = new OpenAI({ 
    apiKey: "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",
    dangerouslyAllowBrowser: true  // Enable browser usage
});

export async function askChatGPT(question) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Using a more reliable model
      messages: [{ role: "user", content: question }],
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error("Error calling ChatGPT:", err);
    
    // Mer specifika felmeddelanden
    if (err.status === 429) {
      return "Taking a quick break! Try moving again in a moment.";
    } else if (err.status === 401) {
      return "API key might need checking!";
    } else {
      return "Temporary pause in responses. Keep moving!";
    }
  }
}
