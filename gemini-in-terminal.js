// --- Configuration ---
const API_KEY = '[YOUR-API-KEY]'; // <<<--- IMPORTANT: Replace with your actual key!
const MODEL_NAME = 'gemini-2.5-pro-exp-03-25'; // Or 'gemini-1.5-pro-latest', etc.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// --- Your Prompt ---
const promptText = "how i can update node.js application to have a web interface";

// --- Function to call the API ---
async function callGemini() {
  console.log(`Calling Gemini API (Model: ${MODEL_NAME})...`);

  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: promptText
        }]
      }],
      // Optional: Add generationConfig if needed (temperature, maxOutputTokens, etc.)
      // generationConfig: {
      //   temperature: 0.7,
      //   maxOutputTokens: 100,
      // }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the request was successful
    if (!response.ok) {
      // Try to parse error details from the response body
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetails += `\nDetails: ${JSON.stringify(errorData, null, 2)}`;
      } catch (jsonError) {
        // If parsing JSON fails, just use the status text
        errorDetails += `\nStatus Text: ${response.statusText}`;
      }
      throw new Error(errorDetails);
    }

    // Parse the JSON response
    const data = await response.json();

    // --- Extract the generated text ---
    // Basic check: Make sure the structure is as expected
    if (data.candidates && data.candidates.length > 0 &&
        data.candidates[0].content && data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0)
    {
      const generatedText = data.candidates[0].content.parts[0].text;
      console.log("\n--- Gemini Response ---");
      console.log(generatedText);
      console.log("---------------------\n");
    } else {
      // Handle cases where the response might be structured differently
      // (e.g., blocked due to safety settings)
      console.error("Could not extract text. Full response:");
      console.log(JSON.stringify(data, null, 2));
       if (data.promptFeedback) {
         console.warn("\nPrompt Feedback:", JSON.stringify(data.promptFeedback, null, 2));
       }
    }

  } catch (error) {
    console.error("\n--- Error calling Gemini API ---");
    console.error(error);
    console.error("------------------------------\n");
  }
}

// --- Run the function ---
// Replace 'YOUR_API_KEY' before running!
if (API_KEY === 'YOUR_API_KEY') {
  console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.warn("!!! PLEASE REPLACE 'YOUR_API_KEY' with your actual API key !!!");
  console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
} else {
  callGemini();
}