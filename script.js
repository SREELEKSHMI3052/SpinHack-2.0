// Sreya's Javascript

// 1. Grab all the HTML elements we need to interact with
const form = document.getElementById('vibe-form');
const input = document.getElementById('mood-input');
const submitBtn = document.getElementById('submit-btn');
const loadingText = document.getElementById('loading-text');
const vibesList = document.getElementById('vibes-list');

// 2. Load existing history as soon as the page opens
window.onload = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/feed');
        const history = await response.json();

        // Loop through the history and display each one
        history.forEach(item => {
            addCardToScreen(item.input, item.quote);
        });
    } catch (error) {
        console.error("Failed to load history:", error);
    }
};

// 3. Handle what happens when the user clicks "Generate"
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Stop the page from refreshing

    const moodText = input.value.trim();

    // Prevent empty submissions
    if (!moodText) return;

    // Turn on loading state
    submitBtn.disabled = true;
    loadingText.classList.remove('hidden');

    try {
        // Send the order to the backend server
        const response = await fetch('http://localhost:5000/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mood: moodText })
        });

        const result = await response.json();

        if (result.success) {
            // Add the new AI quote to the top of the list
            addCardToScreen(moodText, result.quote, true);

            // Clear input field
            input.value = '';
        } else {
            alert("Failed to generate vibe.");
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong. Is the backend running?");
    } finally {
        // Turn off loading state
        submitBtn.disabled = false;
        loadingText.classList.add('hidden');
    }
});

// 4. Helper function to create a vibe card
function addCardToScreen(userInput, aiQuote, addToTop = false) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    cardDiv.innerHTML = `
        <p><strong>You felt:</strong> ${userInput}</p>
        <p><strong>AI says:</strong> ${aiQuote}</p>
    `;

    if (addToTop) {
        vibesList.prepend(cardDiv);
    } else {
        vibesList.appendChild(cardDiv);
    }
}