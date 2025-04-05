// public/script.js
const promptInput = document.getElementById('prompt-input');
const submitButton = document.getElementById('submit-button');
const responseOutput = document.getElementById('response-output');
const statusMessage = document.getElementById('status-message');

submitButton.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();

    if (!prompt) {
        setStatus('Please enter a prompt.', true);
        return;
    }

    // Disable button and show loading state
    submitButton.disabled = true;
    setStatus('Generating response...', false, true); // message, isError, isLoading
    responseOutput.textContent = '...'; // Clear previous output


    try {
        // Call our own backend API endpoint
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }), // Send prompt in request body
        });

        const data = await response.json(); // Always try to parse JSON

        if (!response.ok) {
             // Use error message from backend if available, otherwise use default
            const errorMessage = data.error || `HTTP error! Status: ${response.status}`;
            throw new Error(errorMessage);
        }

        // Display the generated text from the backend response
        responseOutput.textContent = data.generatedText;
        setStatus(''); // Clear status

    } catch (error) {
        console.error('Error:', error);
        responseOutput.textContent = 'Error fetching response.';
        setStatus(`Error: ${error.message}`, true); // Show specific error message
    } finally {
        // Re-enable button regardless of success or failure
        submitButton.disabled = false;
    }
});

function setStatus(message, isError = false, isLoading = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle('error', isError);
    statusMessage.classList.toggle('loading', isLoading && !isError); // Only show loading if not an error
}