document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbacksContainer = document.getElementById('feedbacksContainer');
    const notification = document.getElementById('notification');

    // Load existing feedbacks
    loadFeedbacks();

    // Handle form submission
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = document.getElementById('userId').value;
        const message = document.getElementById('message').value;
        const rating = document.getElementById('rating').value;

        try {
            const response = await fetch('http://localhost:3000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    message,
                    rating: rating || null
                })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Feedback submitted successfully!', 'success');
                feedbackForm.reset();
                loadFeedbacks();
            } else {
                showNotification(data.error || 'Error submitting feedback', 'error');
            }
        } catch (error) {
            showNotification('Error connecting to the server', 'error');
            console.error('Error:', error);
        }
    });

    // Load feedbacks from the blockchain
    async function loadFeedbacks() {
        try {
            const response = await fetch('http://localhost:3000/api/feedbacks');
            const feedbacks = await response.json();

            feedbacksContainer.innerHTML = '';
            feedbacks.forEach(feedback => {
                const feedbackCard = createFeedbackCard(feedback);
                feedbacksContainer.appendChild(feedbackCard);
            });
        } catch (error) {
            console.error('Error loading feedbacks:', error);
            showNotification('Error loading feedbacks', 'error');
        }
    }

    // Create feedback card element
    function createFeedbackCard(feedback) {
        const card = document.createElement('div');
        card.className = 'feedback-card';

        const date = new Date(feedback.timestamp).toLocaleString();
        
        card.innerHTML = `
            <h3>User: ${feedback.userId}</h3>
            <p>${feedback.message}</p>
            ${feedback.rating ? `<p class="rating">Rating: ${feedback.rating}/5</p>` : ''}
            <p class="timestamp">${date}</p>
        `;

        return card;
    }

    // Show notification
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    }
}); 