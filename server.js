// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path'); // To work with file paths

const app = express();
const PORT = process.env.PORT || 3000; // Use port from env or default to 3000

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-flash-latest'; // Or your preferred model

if (!API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is not set in the .env file.");
    process.exit(1); // Exit if the key is missing
}

// --- Middleware ---
// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Parse JSON request bodies (needed to get the prompt from the frontend)
app.use(express.json());

// --- API Endpoint ---
// This is the endpoint our frontend will call
app.post('/api/generate', async (req, res) => {
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    console.log(`Received prompt: "${userPrompt}"`); // Log received prompt

    try {
        const requestBody = {
            contents: [{
                parts: [{
                    text: userPrompt
                }]
            }],
            // Optional generation config
            // generationConfig: {
            //   temperature: 0.7,
            //   maxOutputTokens: 200,
            // }
        };

        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!geminiResponse.ok) {
            // Try to get error details from Gemini API response
            let errorDetails = `Gemini API Error: ${geminiResponse.status}`;
            try {
                const errorData = await geminiResponse.json();
                errorDetails += `\nDetails: ${JSON.stringify(errorData, null, 2)}`;
            } catch (e) { /* Ignore if error response isn't JSON */ }
            console.error(errorDetails); // Log detailed error on the server
            // Send a generic error back to the client for security
            return res.status(geminiResponse.status).json({ error: 'Failed to get response from Gemini API.' });
        }

        const data = await geminiResponse.json();

        // --- Extract the generated text ---
        let generatedText = "Could not extract text from response."; // Default
        if (data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content && data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0)
        {
            generatedText = data.candidates[0].content.parts[0].text;
            console.log("Successfully generated response.");
        } else {
            console.warn("Could not extract text. Response structure might have changed or content was blocked.");
            console.warn("Full Gemini Response:", JSON.stringify(data, null, 2));
            if (data.promptFeedback) {
               generatedText = `Blocked: ${data.promptFeedback.blockReason || 'Unknown reason'}`;
               if(data.promptFeedback.blockReasonMessage) {
                   generatedText += ` - ${data.promptFeedback.blockReasonMessage}`
               }
            }
        }

        // Send the generated text back to the frontend
        res.json({ generatedText: generatedText });

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Ensure your GEMINI_API_KEY is set in the .env file.`);
});