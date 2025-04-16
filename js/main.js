document.addEventListener('DOMContentLoaded', () => {
    // API URL
    const API_URL = 'http://localhost:3000/api';
    
    // Check if blockchain data is already loaded
    let blockchainLoaded = false;
    
    // Elements
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbacksContainer = document.getElementById('feedbacksContainer');
    const notification = document.getElementById('notification');
    
    // Initialize page specific functionality
    initPageFunctions();
    
    // Handle feedback form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmission);
    }
    
    // Page specific initialization
    function initPageFunctions() {
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('view.html')) {
            initViewPage();
        } else if (currentPage.includes('feedback.html')) {
            initFeedbackPage();
        } else if (currentPage.includes('dashboard.html')) {
            initDashboardPage();
        } else if (currentPage.includes('request.html')) {
            initRequestPage();
        } else if (currentPage === '/' || currentPage.includes('index.html')) {
            // Home page specific initialization if needed
        }
        
        // Initialize tab system on all pages
        initTabSystem();
    }
    
    // Initialize view page functionality
    function initViewPage() {
        loadBlockchainData();
        
        // Set up event listeners for view page controls
        const refreshDataBtn = document.getElementById('refreshData');
        const validateChainBtn = document.getElementById('validateChain');
        const userFilter = document.getElementById('userFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const sortOption = document.getElementById('sortOption');
        
        // Request filters
        const requestUserFilter = document.getElementById('requestUserFilter');
        const requestCategoryFilter = document.getElementById('requestCategoryFilter');
        const requestStatusFilter = document.getElementById('requestStatusFilter');
        const requestSortOption = document.getElementById('requestSortOption');
        
        // Response filters
        const responseRequestFilter = document.getElementById('responseRequestFilter');
        const responseUserFilter = document.getElementById('responseUserFilter');
        const responseSortOption = document.getElementById('responseSortOption');
        
        if (refreshDataBtn) {
            refreshDataBtn.addEventListener('click', loadBlockchainData);
        }
        
        if (validateChainBtn) {
            validateChainBtn.addEventListener('click', validateBlockchain);
        }
        
        if (userFilter) {
            userFilter.addEventListener('input', filterFeedbacks);
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterFeedbacks);
        }
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', filterFeedbacks);
        }
        
        if (sortOption) {
            sortOption.addEventListener('change', sortFeedbacks);
        }
        
        // Request filter listeners
        if (requestUserFilter) {
            requestUserFilter.addEventListener('input', filterRequests);
        }
        
        if (requestCategoryFilter) {
            requestCategoryFilter.addEventListener('change', filterRequests);
        }
        
        if (requestStatusFilter) {
            requestStatusFilter.addEventListener('change', filterRequests);
        }
        
        if (requestSortOption) {
            requestSortOption.addEventListener('change', sortRequests);
        }
        
        // Response filter listeners
        if (responseRequestFilter) {
            responseRequestFilter.addEventListener('input', filterResponses);
        }
        
        if (responseUserFilter) {
            responseUserFilter.addEventListener('input', filterResponses);
        }
        
        if (responseSortOption) {
            responseSortOption.addEventListener('change', sortResponses);
        }
    }
    
    // Load blockchain data
    async function loadBlockchainData() {
        try {
            // Get chain data
            const chainResponse = await fetch(`${API_URL}/chain`);
            const chainData = await chainResponse.json();
            
            if (chainData.success) {
                updateBlockchainStats(chainData.chain);
                
                // Load feedbacks
                const feedbacksResponse = await fetch(`${API_URL}/feedbacks`);
                const feedbacksData = await feedbacksResponse.json();
                
                if (feedbacksData.success) {
                    displayFeedbacks(feedbacksData.feedbacks);
                }
                
                // Load requests
                const requestsResponse = await fetch(`${API_URL}/requests`);
                const requestsData = await requestsResponse.json();
                
                if (requestsData.success) {
                    displayRequests(requestsData.requests);
                }
                
                // Load responses
                const responsesResponse = await fetch(`${API_URL}/responses`);
                const responsesData = await responsesResponse.json();
                
                if (responsesData.success) {
                    displayResponses(responsesData.responses);
                }
            }
        } catch (error) {
            console.error('Error loading blockchain data:', error);
            showNotification('Error loading blockchain data', 'error');
        }
    }
    
    // Update blockchain statistics
    function updateBlockchainStats(chain) {
        const blockCount = document.getElementById('blockCount');
        const feedbackCount = document.getElementById('feedbackCount');
        
        if (blockCount) {
            blockCount.textContent = chain.length;
        }
        
        if (feedbackCount) {
            let totalFeedbacks = 0;
            
            // Count all feedbacks in the chain
            for (let i = 1; i < chain.length; i++) {
                if (Array.isArray(chain[i].data)) {
                    totalFeedbacks += chain[i].data.length;
                }
            }
            
            feedbackCount.textContent = totalFeedbacks;
        }
    }
    
    // Validate blockchain integrity
    async function validateBlockchain() {
        try {
            const response = await fetch(`${API_URL}/validate`);
            const data = await response.json();
            
            const chainValid = document.getElementById('chainValid');
            
            if (chainValid) {
                if (data.isValid) {
                    chainValid.textContent = '✓ Valid';
                    chainValid.style.color = 'var(--success-color)';
                } else {
                    chainValid.textContent = '✗ Invalid';
                    chainValid.style.color = 'var(--error-color)';
                }
            }
            
            showNotification(
                data.isValid 
                    ? 'Blockchain validation successful! Chain is valid.' 
                    : 'Blockchain validation failed! Chain is invalid.',
                data.isValid ? 'success' : 'error'
            );
        } catch (error) {
            console.error('Error validating blockchain:', error);
            showNotification('Error validating blockchain', 'error');
        }
    }
    
    // Handle feedback form submission
    async function handleFeedbackSubmission(e) {
        e.preventDefault();
        
        const nickname = document.getElementById('nickname').value.trim();
        const message = document.getElementById('message').value.trim();
        const category = document.getElementById('category').value;
        const ratingType = document.querySelector('input[name="rating-type"]:checked').value;
        const tagsElement = document.getElementById('tags');
        
        if (!message) {
            showNotification('Please enter a feedback message', 'error');
            return;
        }
        
        // Generate a hash if no nickname provided
        const userIdentifier = nickname || generateUserHash();
        
        let rating = null;
        if (ratingType === 'numeric') {
            rating = document.getElementById('numeric-rating-select').value;
        } else {
            rating = document.getElementById('text-rating-select').value;
        }
        
        const tags = tagsElement && tagsElement.value ? tagsElement.value.split(',').map(tag => tag.trim()) : [];
        
        const feedbackData = { 
            userId: userIdentifier, 
            message, 
            rating, 
            category, 
            tags,
            isAnonymous: !nickname
        };
        
        try {
            const response = await fetch(`${API_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('feedbackForm').reset();
                showNotification('Feedback submitted successfully!', 'success');
                
                // Refresh feedback data if we're on the view page
                if (window.location.pathname.includes('/view.html')) {
                    loadBlockchainData();
                }
            } else {
                showNotification(data.error || 'Failed to submit feedback', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Failed to connect to the server', 'error');
        }
    }
    
    // Generate a unique user hash for anonymous users
    function generateUserHash() {
        const timestamp = Date.now().toString();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const hashInput = timestamp + randomStr;
        
        // Simple hash function for demo purposes
        let hash = 0;
        for (let i = 0; i < hashInput.length; i++) {
            const char = hashInput.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return 'anon_' + Math.abs(hash).toString(16).substring(0, 8);
    }
    
    // Display feedbacks in container
    function displayFeedbacks(feedbacks) {
        if (!feedbacksContainer) return;
        
        if (feedbacks.length === 0) {
            feedbacksContainer.innerHTML = '<div class="no-data">No feedbacks available</div>';
            return;
        }
        
        feedbacksContainer.innerHTML = '';
        
        // Sort feedbacks by newest first (default)
        feedbacks.sort((a, b) => b.timestamp - a.timestamp);
        
        feedbacks.forEach(feedback => {
            const feedbackCard = createFeedbackCard(feedback);
            feedbacksContainer.appendChild(feedbackCard);
        });
    }
    
    // Filter feedbacks by various criteria
    function filterFeedbacks() {
        const userId = document.getElementById('userFilter').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;
        const feedbackCards = document.querySelectorAll('.feedback-card');
        
        feedbackCards.forEach(card => {
            const cardUserId = card.dataset.userId.toLowerCase();
            const cardCategory = card.dataset.category || '';
            
            const userMatch = userId === '' || cardUserId.includes(userId);
            const categoryMatch = category === '' || cardCategory === category;
            
            if (userMatch && categoryMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Sort feedbacks based on selected option
    function sortFeedbacks() {
        const sortOption = document.getElementById('sortOption').value;
        const feedbackCards = Array.from(document.querySelectorAll('.feedback-card'));
        
        // Sort based on selected option
        switch(sortOption) {
            case 'newest':
                feedbackCards.sort((a, b) => parseInt(b.dataset.timestamp) - parseInt(a.dataset.timestamp));
                break;
            case 'oldest':
                feedbackCards.sort((a, b) => parseInt(a.dataset.timestamp) - parseInt(b.dataset.timestamp));
                break;
            case 'rating':
                feedbackCards.sort((a, b) => {
                    // Handle both numeric and text ratings
                    const ratingA = a.dataset.rating || '';
                    const ratingB = b.dataset.rating || '';
                    
                    // If ratings are numeric
                    if (!isNaN(ratingA) && !isNaN(ratingB)) {
                        return parseInt(ratingB) - parseInt(ratingA);
                    }
                    
                    // If ratings are text
                    const ratingValues = {
                        '': 0,
                        'Poor': 1,
                        'Fair': 2,
                        'Good': 3,
                        'Very Good': 4,
                        'Excellent': 5
                    };
                    
                    return (ratingValues[ratingB] || 0) - (ratingValues[ratingA] || 0);
                });
                break;
            case 'priority':
                feedbackCards.sort((a, b) => {
                    const priorityValues = {
                        '': 0,
                        'low': 1,
                        'medium': 2,
                        'high': 3,
                        'critical': 4
                    };
                    
                    const priorityA = a.dataset.priority || '';
                    const priorityB = b.dataset.priority || '';
                    
                    return priorityValues[priorityB] - priorityValues[priorityA];
                });
                break;
        }
        
        // Re-append sorted cards
        feedbacksContainer.innerHTML = '';
        feedbackCards.forEach(card => {
            feedbacksContainer.appendChild(card);
        });
    }
    
    // Create feedback card element
    function createFeedbackCard(feedback) {
        const card = document.createElement('div');
        card.className = 'feedback-card';
        
        // Add data attributes for filtering and sorting
        card.dataset.userId = feedback.userId;
        card.dataset.timestamp = feedback.timestamp;
        card.dataset.rating = feedback.rating || 0;
        if (feedback.category) card.dataset.category = feedback.category;
        if (feedback.priority) card.dataset.priority = feedback.priority;
        
        const date = new Date(feedback.timestamp).toLocaleString();
        
        // Build tags HTML if they exist
        let tagsHtml = '';
        if (feedback.tags && feedback.tags.length > 0) {
            tagsHtml = `<div class="tags">
                ${feedback.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>`;
        }
        
        // Build category and priority HTML if they exist
        let categoryHtml = feedback.category ? `<span class="category">${feedback.category}</span>` : '';
        let priorityHtml = feedback.priority ? `<span class="priority priority-${feedback.priority}">${feedback.priority}</span>` : '';
        
        card.innerHTML = `
            <div class="feedback-header">
                <h3>User: ${feedback.userId}</h3>
                <div class="feedback-meta">
                    ${categoryHtml}
                    ${priorityHtml}
                    ${feedback.rating ? `<span class="rating">${feedback.rating}</span>` : ''}
                </div>
            </div>
            <p>${feedback.message}</p>
            ${tagsHtml}
            <p class="timestamp">${date}</p>
        `;
        
        return card;
    }
    
    // Initialize feedback page
    function initFeedbackPage() {
        // Set up rating type toggle
        const ratingTypeRadios = document.querySelectorAll('input[name="rating-type"]');
        const numericRating = document.getElementById('numeric-rating');
        const textRating = document.getElementById('text-rating');
        
        ratingTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'numeric') {
                    numericRating.style.display = 'block';
                    textRating.style.display = 'none';
                } else {
                    numericRating.style.display = 'none';
                    textRating.style.display = 'block';
                }
            });
        });
        
        // Set up load all requests button
        const loadAllRequestsBtn = document.getElementById('loadAllRequests');
        if (loadAllRequestsBtn) {
            loadAllRequestsBtn.addEventListener('click', loadAllActiveRequests);
            // Automatically load active requests when page loads
            if (document.querySelector('.tab-btn.active').dataset.tab === 'requests') {
                loadAllActiveRequests();
            }
        }
    }
    
    // Initialize tab system
    function initTabSystem() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                const container = button.closest('.tabs').parentElement;
                
                // Remove active class from all buttons in this tab group
                button.closest('.tabs').querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to this button
                button.classList.add('active');
                
                // Hide all tab content
                container.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show selected tab content
                const tabContent = container.querySelector(`#${tabName}-tab`);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
    }
    
    // Initialize dashboard page
    function initDashboardPage() {
        const loadUserDataBtn = document.getElementById('loadUserData');
        
        if (loadUserDataBtn) {
            loadUserDataBtn.addEventListener('click', loadUserDashboardData);
        }
    }
    
    // Load user dashboard data
    async function loadUserDashboardData() {
        const userId = document.getElementById('currentUserId').value;
        
        if (!userId) {
            showNotification('Please enter your User ID', 'error');
            return;
        }
        
        try {
            // Get user stats
            const statsResponse = await fetch(`${API_URL}/stats/${userId}`);
            const statsData = await statsResponse.json();
            
            if (statsData.success) {
                updateDashboardStats(statsData.stats);
                
                // Get feedbacks given by user
                const feedbacksResponse = await fetch(`${API_URL}/feedbacks/user/${userId}`);
                const feedbacksData = await feedbacksResponse.json();
                
                if (feedbacksData.success) {
                    displayUserFeedbacks(feedbacksData.feedbacks);
                }
                
                // Get requests created by user
                const requestsResponse = await fetch(`${API_URL}/requests/user/${userId}`);
                const requestsData = await requestsResponse.json();
                
                if (requestsData.success) {
                    displayUserRequests(requestsData.requests);
                }
                
                // Get responses to user's requests
                const responsesResponse = await fetch(`${API_URL}/responses/for-user/${userId}`);
                const responsesData = await responsesResponse.json();
                
                if (responsesData.success) {
                    displayUserResponses(responsesData.responses);
                }
                
                showNotification('Dashboard data loaded successfully', 'success');
            } else {
                showNotification('Error loading user data', 'error');
            }
        } catch (error) {
            console.error('Error loading user dashboard data:', error);
            showNotification('Error connecting to the server', 'error');
        }
    }
    
    // Update dashboard stats
    function updateDashboardStats(stats) {
        const feedbacksGiven = document.getElementById('feedbacksGiven');
        const requestsCreated = document.getElementById('requestsCreated');
        const responsesReceived = document.getElementById('responsesReceived');
        const avgRatingReceived = document.getElementById('avgRatingReceived');
        
        if (feedbacksGiven) feedbacksGiven.textContent = stats.feedbacksGiven;
        if (requestsCreated) requestsCreated.textContent = stats.requestsCreated;
        if (responsesReceived) responsesReceived.textContent = stats.responsesReceived;
        if (avgRatingReceived) avgRatingReceived.textContent = stats.avgRatingReceived;
    }
    
    // Display user feedbacks on dashboard
    function displayUserFeedbacks(feedbacks) {
        const container = document.getElementById('feedbacksGivenContainer');
        if (!container) return;
        
        if (feedbacks.length === 0) {
            container.innerHTML = '<p class="placeholder-text">You haven\'t given any feedback yet</p>';
            return;
        }
        
        container.innerHTML = '';
        
        // Sort feedbacks by newest first
        feedbacks.sort((a, b) => b.timestamp - a.timestamp);
        
        feedbacks.forEach(feedback => {
            const feedbackCard = createFeedbackCard(feedback);
            container.appendChild(feedbackCard);
        });
    }
    
    // Display user requests on dashboard
    function displayUserRequests(requests) {
        const container = document.getElementById('requestsCreatedContainer');
        if (!container) return;
        
        if (requests.length === 0) {
            container.innerHTML = '<p class="placeholder-text">You haven\'t created any feedback requests yet</p>';
            return;
        }
        
        container.innerHTML = '';
        
        // Sort requests by newest first
        requests.sort((a, b) => b.timestamp - a.timestamp);
        
        requests.forEach(request => {
            const requestCard = createRequestCard(request);
            container.appendChild(requestCard);
        });
    }
    
    // Display responses to user's requests
    function displayUserResponses(responses) {
        const container = document.getElementById('responsesReceivedContainer');
        if (!container) return;
        
        if (responses.length === 0) {
            container.innerHTML = '<p class="placeholder-text">You haven\'t received any responses yet</p>';
            return;
        }
        
        container.innerHTML = '';
        
        // Sort responses by newest first
        responses.sort((a, b) => b.timestamp - a.timestamp);
        
        responses.forEach(response => {
            const responseCard = createResponseCard(response);
            container.appendChild(responseCard);
        });
    }
    
    // Create request card element
    function createRequestCard(request) {
        const card = document.createElement('div');
        card.className = 'request-card';
        
        // Add data attributes for filtering and sorting
        card.dataset.userId = request.userId;
        card.dataset.requestId = request.requestId;
        card.dataset.timestamp = request.timestamp;
        card.dataset.category = request.category || '';
        card.dataset.status = request.status || 'active';
        
        const date = new Date(request.timestamp).toLocaleString();
        
        // Build tags HTML if they exist
        let tagsHtml = '';
        if (request.tags && request.tags.length > 0) {
            tagsHtml = `<div class="tags">
                ${request.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>`;
        }
        
        // Build category and status HTML
        let categoryHtml = request.category ? `<span class="category">${request.category}</span>` : '';
        let statusHtml = `<span class="status-badge status-${request.status}">${request.status}</span>`;
        
        card.innerHTML = `
            <div class="request-header">
                <h3 class="request-title">${request.title}</h3>
                <div class="request-meta">
                    ${categoryHtml}
                    ${statusHtml}
                </div>
            </div>
            <p class="request-description">${request.description}</p>
            ${tagsHtml}
            <div class="request-footer">
                <span class="request-timestamp">Created: ${date}</span>
                <div class="request-actions">
                    <button class="btn-secondary view-request-btn" data-request-id="${request.requestId}">View Details</button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Create response card element
    function createResponseCard(response) {
        const card = document.createElement('div');
        card.className = 'feedback-card';
        
        // Add data attributes for filtering and sorting
        card.dataset.userId = response.userId;
        card.dataset.requestId = response.requestId;
        card.dataset.timestamp = response.timestamp;
        card.dataset.rating = response.rating || 0;
        
        const date = new Date(response.timestamp).toLocaleString();
        
        card.innerHTML = `
            <div class="feedback-header">
                <h4>Response from: ${response.userId}</h4>
                <div class="feedback-meta">
                    ${response.rating ? `<span class="rating">${response.rating}</span>` : ''}
                </div>
            </div>
            <p>${response.message}</p>
            <p class="timestamp">Submitted: ${date}</p>
        `;
        
        return card;
    }
    
    // Initialize request page
    function initRequestPage() {
        const requestForm = document.getElementById('requestForm');
        const loadRequestsBtn = document.getElementById('loadRequests');
        
        if (requestForm) {
            requestForm.addEventListener('submit', handleRequestSubmission);
        }
        
        if (loadRequestsBtn) {
            loadRequestsBtn.addEventListener('click', loadUserRequests);
        }
    }
    
    // Handle feedback request form submission
    async function handleRequestSubmission(e) {
        e.preventDefault();
        
        const userId = document.getElementById('requestUserId').value;
        const title = document.getElementById('requestTitle').value;
        const description = document.getElementById('requestDescription').value;
        const category = document.getElementById('requestCategory').value;
        const expiryDate = document.getElementById('requestExpiryDate').value;
        const tags = document.getElementById('requestTags').value;
        const collectNumericRating = document.getElementById('collectNumericRating').checked;
        const collectTextRating = document.getElementById('collectTextRating').checked;
        const customQuestions = document.getElementById('customQuestions').value;
        
        if (!userId || !title || !description) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Process tags
        const processedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];
        
        // Process custom questions
        const processedQuestions = customQuestions ? 
            customQuestions.split('\n').filter(q => q.trim() !== '') : [];
        
        try {
            const response = await fetch(`${API_URL}/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    title,
                    description,
                    category: category || null,
                    expiryDate: expiryDate || null,
                    tags: processedTags,
                    collectNumericRating,
                    collectTextRating,
                    customQuestions: processedQuestions
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Feedback request submitted successfully!', 'success');
                requestForm.reset();
                
                // Reload user's requests
                setTimeout(() => {
                    if (document.getElementById('yourRequestsUserId')) {
                        document.getElementById('yourRequestsUserId').value = userId;
                        loadUserRequests();
                    }
                }, 1000);
            } else {
                showNotification(data.error || 'Error submitting feedback request', 'error');
            }
        } catch (error) {
            console.error('Error submitting feedback request:', error);
            showNotification('Error connecting to the server', 'error');
        }
    }
    
    // Load user's feedback requests
    async function loadUserRequests() {
        const userId = document.getElementById('yourRequestsUserId').value;
        
        if (!userId) {
            showNotification('Please enter your User ID', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/requests/user/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                displayUserRequestsList(data.requests);
            } else {
                showNotification('Error loading feedback requests', 'error');
            }
        } catch (error) {
            console.error('Error loading feedback requests:', error);
            showNotification('Error connecting to the server', 'error');
        }
    }
    
    // Display user's feedback requests
    function displayUserRequestsList(requests) {
        const container = document.getElementById('yourRequestsContainer');
        if (!container) return;
        
        if (requests.length === 0) {
            container.innerHTML = '<p class="placeholder-text">You haven\'t created any feedback requests yet</p>';
            return;
        }
        
        container.innerHTML = '';
        
        // Sort requests by newest first
        requests.sort((a, b) => b.timestamp - a.timestamp);
        
        requests.forEach(request => {
            const requestCard = createRequestCard(request, true);
            container.appendChild(requestCard);
        });
        
        // Add event listeners for edit/status buttons
        attachRequestActionListeners();
    }
    
    // Enhanced createRequestCard function with owner actions
    function createRequestCard(request, isOwner = false) {
        const card = document.createElement('div');
        card.className = 'request-card';
        
        // Add data attributes for filtering and sorting
        card.dataset.userId = request.userId;
        card.dataset.requestId = request.requestId;
        card.dataset.timestamp = request.timestamp;
        card.dataset.category = request.category || '';
        card.dataset.status = request.status || 'active';
        
        const date = new Date(request.timestamp).toLocaleString();
        
        // Build tags HTML if they exist
        let tagsHtml = '';
        if (request.tags && request.tags.length > 0) {
            tagsHtml = `<div class="tags">
                ${request.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>`;
        }
        
        // Build category and status HTML
        let categoryHtml = request.category ? `<span class="category">${request.category}</span>` : '';
        let statusHtml = `<span class="status-badge status-${request.status}">${request.status}</span>`;
        
        // Build owner action buttons if this is the owner's view
        let actionButtons = `<button class="btn-secondary view-request-btn" data-request-id="${request.requestId}">View Details</button>`;
        
        if (isOwner) {
            if (request.status === 'active') {
                actionButtons += `
                    <button class="btn-secondary close-request-btn" data-request-id="${request.requestId}">Close</button>
                `;
            } else if (request.status === 'closed') {
                actionButtons += `
                    <button class="btn-secondary reopen-request-btn" data-request-id="${request.requestId}">Reopen</button>
                `;
            }
        } else {
            if (request.status === 'active') {
                actionButtons += `
                    <button class="btn-primary respond-btn" data-request-id="${request.requestId}" 
                        data-request-title="${request.title}" 
                        data-numeric="${request.collectNumericRating}" 
                        data-text="${request.collectTextRating}">
                        Respond
                    </button>
                `;
            }
        }
        
        card.innerHTML = `
            <div class="request-header">
                <h3 class="request-title">${request.title}</h3>
                <div class="request-meta">
                    ${categoryHtml}
                    ${statusHtml}
                </div>
            </div>
            <p class="request-description">${request.description}</p>
            ${tagsHtml}
            <div class="request-footer">
                <span class="request-timestamp">Created by ${request.userId} on ${date}</span>
                <div class="request-actions">
                    ${actionButtons}
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Attach event listeners to request action buttons
    function attachRequestActionListeners() {
        // Close request buttons
        document.querySelectorAll('.close-request-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const requestId = button.dataset.requestId;
                await updateRequestStatus(requestId, 'closed');
            });
        });
        
        // Reopen request buttons
        document.querySelectorAll('.reopen-request-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const requestId = button.dataset.requestId;
                await updateRequestStatus(requestId, 'active');
            });
        });
        
        // View request details buttons
        document.querySelectorAll('.view-request-btn').forEach(button => {
            button.addEventListener('click', () => {
                const requestId = button.dataset.requestId;
                viewRequestDetails(requestId);
            });
        });
    }
    
    // Update request status
    async function updateRequestStatus(requestId, status) {
        const userId = document.getElementById('yourRequestsUserId').value;
        
        if (!userId) {
            showNotification('Please enter your User ID', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/request/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    status
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(`Request ${status === 'active' ? 'reopened' : 'closed'} successfully`, 'success');
                // Reload user's requests
                loadUserRequests();
            } else {
                showNotification(data.error || 'Error updating request status', 'error');
            }
        } catch (error) {
            console.error('Error updating request status:', error);
            showNotification('Error connecting to the server', 'error');
        }
    }
    
    // View request details
    async function viewRequestDetails(requestId) {
        try {
            const response = await fetch(`${API_URL}/request/${requestId}`);
            const data = await response.json();
            
            if (data.success) {
                showRequestDetailModal(data.request, data.responses);
            } else {
                showNotification('Error loading request details', 'error');
            }
        } catch (error) {
            console.error('Error loading request details:', error);
            showNotification('Error connecting to the server', 'error');
        }
    }
    
    // Show request detail modal
    function showRequestDetailModal(request, responses) {
        const modal = document.getElementById('requestDetailModal');
        const modalContent = document.getElementById('requestDetailContent');
        
        if (!modal || !modalContent) return;
        
        const date = new Date(request.timestamp).toLocaleString();
        
        // Build tags HTML
        let tagsHtml = '';
        if (request.tags && request.tags.length > 0) {
            tagsHtml = `<div class="tags">
                ${request.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>`;
        }
        
        // Build responses HTML
        let responsesHtml = '';
        if (responses.length > 0) {
            responses.sort((a, b) => b.timestamp - a.timestamp);
            responsesHtml = `
                <h3>Responses (${responses.length})</h3>
                <div class="responses-list">
                    ${responses.map(response => {
                        const responseDate = new Date(response.timestamp).toLocaleString();
                        return `
                            <div class="feedback-card">
                                <div class="feedback-header">
                                    <h4>Response from: ${response.userId}</h4>
                                    <div class="feedback-meta">
                                        ${response.rating ? `<span class="rating">${response.rating}</span>` : ''}
                                    </div>
                                </div>
                                <p>${response.message}</p>
                                <p class="timestamp">Submitted: ${responseDate}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            responsesHtml = `<p class="placeholder-text">No responses yet</p>`;
        }
        
        modalContent.innerHTML = `
            <h2>${request.title}</h2>
            <div class="request-meta">
                <span class="category">${request.category || 'Uncategorized'}</span>
                <span class="status-badge status-${request.status}">${request.status}</span>
            </div>
            <p class="request-creator">Created by: ${request.userId} on ${date}</p>
            <div class="request-detail-description">
                <h3>Description</h3>
                <p>${request.description}</p>
                ${tagsHtml}
            </div>
            <div class="request-detail-responses">
                ${responsesHtml}
            </div>
        `;
        
        // Show the modal
        modal.style.display = 'block';
        
        // Close modal when X is clicked
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Show notification
    function showNotification(message, type) {
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    }

    // Display all feedback requests
    function displayRequests(requests) {
        const container = document.getElementById('allRequestsContainer');
        if (!container) return;
        
        if (requests.length === 0) {
            container.innerHTML = '<div class="no-data">No feedback requests available</div>';
            return;
        }
        
        container.innerHTML = '';
        
        // Sort requests by newest first (default)
        requests.sort((a, b) => b.timestamp - a.timestamp);
        
        requests.forEach(request => {
            const requestCard = createRequestCard(request);
            container.appendChild(requestCard);
        });
        
        // Add event listeners for buttons
        container.querySelectorAll('.respond-btn').forEach(button => {
            button.addEventListener('click', () => {
                const requestId = button.dataset.requestId;
                const requestTitle = button.dataset.requestTitle;
                const collectNumeric = button.dataset.numeric === 'true';
                const collectText = button.dataset.text === 'true';
                
                showResponseForm(requestId, requestTitle, collectNumeric, collectText);
            });
        });
        
        container.querySelectorAll('.view-request-btn').forEach(button => {
            button.addEventListener('click', () => {
                const requestId = button.dataset.requestId;
                viewRequestDetails(requestId);
            });
        });
    }

    // Display all responses
    function displayResponses(responses) {
        const container = document.getElementById('responsesContainer');
        if (!container) return;
        
        if (responses.length === 0) {
            container.innerHTML = '<div class="no-data">No responses available</div>';
            return;
        }
        
        container.innerHTML = '';
        
        // Sort responses by newest first (default)
        responses.sort((a, b) => b.timestamp - a.timestamp);
        
        responses.forEach(response => {
            const responseCard = createResponseCard(response);
            container.appendChild(responseCard);
        });
    }

    // Show response form for a request
    function showResponseForm(requestId, requestTitle, collectNumeric, collectText) {
        const formContainer = document.getElementById('responseFormContainer');
        const titleElem = document.getElementById('responseRequestTitle');
        const requestIdField = document.getElementById('responseRequestId');
        const ratingContainer = document.getElementById('responseRatingContainer');
        
        if (!formContainer || !titleElem || !requestIdField || !ratingContainer) return;
        
        // Set the request title and ID
        titleElem.textContent = requestTitle;
        requestIdField.value = requestId;
        
        // Create rating inputs based on request settings
        let ratingHtml = '';
        
        if (collectNumeric && collectText) {
            ratingHtml = `
                <label>Rating Type</label>
                <div class="rating-options">
                    <div class="rating-type-toggle">
                        <label>
                            <input type="radio" name="response-rating-type" value="numeric" checked> Numeric
                        </label>
                        <label>
                            <input type="radio" name="response-rating-type" value="text"> Text
                        </label>
                    </div>
                    
                    <div id="response-numeric-rating" class="rating-input">
                        <select id="response-numeric-rating-select">
                            <option value="">Select Rating</option>
                            <option value="1">1 - Poor</option>
                            <option value="2">2 - Fair</option>
                            <option value="3">3 - Good</option>
                            <option value="4">4 - Very Good</option>
                            <option value="5">5 - Excellent</option>
                        </select>
                    </div>
                    
                    <div id="response-text-rating" class="rating-input" style="display: none;">
                        <select id="response-text-rating-select">
                            <option value="">Select Rating</option>
                            <option value="Poor">Poor</option>
                            <option value="Fair">Fair</option>
                            <option value="Good">Good</option>
                            <option value="Very Good">Very Good</option>
                            <option value="Excellent">Excellent</option>
                        </select>
                    </div>
                </div>
            `;
        } else if (collectNumeric) {
            ratingHtml = `
                <label for="response-numeric-rating-select">Rating</label>
                <select id="response-numeric-rating-select">
                    <option value="">Select Rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                </select>
            `;
        } else if (collectText) {
            ratingHtml = `
                <label for="response-text-rating-select">Rating</label>
                <select id="response-text-rating-select">
                    <option value="">Select Rating</option>
                    <option value="Poor">Poor</option>
                    <option value="Fair">Fair</option>
                    <option value="Good">Good</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Excellent">Excellent</option>
                </select>
            `;
        }
        
        ratingContainer.innerHTML = ratingHtml;
        
        // Initialize rating toggle functionality if both types are used
        if (collectNumeric && collectText) {
            const ratingTypeRadios = formContainer.querySelectorAll('input[name="response-rating-type"]');
            const numericRating = document.getElementById('response-numeric-rating');
            const textRating = document.getElementById('response-text-rating');
            
            ratingTypeRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    if (radio.value === 'numeric') {
                        numericRating.style.display = 'block';
                        textRating.style.display = 'none';
                    } else {
                        numericRating.style.display = 'none';
                        textRating.style.display = 'block';
                    }
                });
            });
        }
        
        // Show the response form
        formContainer.style.display = 'block';
        
        // Scroll to the form
        formContainer.scrollIntoView({ behavior: 'smooth' });
        
        // Setup cancel button
        const cancelBtn = document.getElementById('cancelResponse');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                formContainer.style.display = 'none';
            });
        }
        
        // Setup form submission
        const responseForm = document.getElementById('responseForm');
        if (responseForm) {
            responseForm.addEventListener('submit', handleResponseSubmission);
        }
    }

    // Handle response form submission
    async function handleResponseSubmission(e) {
        e.preventDefault();
        
        const requestId = document.getElementById('responseRequestId').value;
        const nickname = document.getElementById('responseNickname').value.trim();
        const message = document.getElementById('responseMessage').value.trim();
        
        if (!message) {
            showNotification('Please enter your feedback response', 'error');
            return;
        }
        
        // Generate a hash if no nickname provided
        const userIdentifier = nickname || generateUserHash();
        
        // Get rating if applicable
        let rating = null;
        const numericRatingElement = document.getElementById('responseNumericRating');
        const textRatingElement = document.getElementById('responseTextRating');
        
        if (numericRatingElement) {
            rating = numericRatingElement.value;
        } else if (textRatingElement) {
            rating = textRatingElement.value;
        }
        
        // Get answers to custom questions
        const answers = [];
        const questionElements = document.querySelectorAll('.custom-question');
        questionElements.forEach(element => {
            const questionId = element.dataset.questionId;
            const answer = element.value.trim();
            if (answer) {
                answers.push({
                    questionId,
                    answer
                });
            }
        });
        
        // Create request payload
        const payload = {
            requestId,
            userId: userIdentifier,
            message,
            rating,
            answers,
            isAnonymous: !nickname
        };
        
        console.log('Submitting response with payload:', payload);
        console.log('API URL:', `${API_URL}/respond`);
        
        try {
            showNotification('Submitting your response...', 'info');
            
            const response = await fetch(`${API_URL}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                document.getElementById('responseForm').reset();
                document.getElementById('responseFormContainer').style.display = 'none';
                showNotification('Response submitted successfully!', 'success');
                
                // Refresh requests data
                loadAllActiveRequests();
                
                // Refresh responses data if on view page
                if (window.location.pathname.includes('/view.html')) {
                    loadBlockchainData();
                }
            } else {
                showNotification(data.error || 'Failed to submit response', 'error');
            }
        } catch (error) {
            console.error('Error submitting response:', error);
            showNotification(`Failed to connect to the server: ${error.message}`, 'error');
        }
    }

    // Filter requests based on selected filters
    function filterRequests() {
        const userFilter = document.getElementById('requestUserFilter').value.toLowerCase();
        const categoryFilter = document.getElementById('requestCategoryFilter').value;
        const statusFilter = document.getElementById('requestStatusFilter').value;
        
        const requestCards = document.querySelectorAll('#allRequestsContainer .request-card');
        
        requestCards.forEach(card => {
            const cardUserId = card.dataset.userId.toLowerCase();
            const cardCategory = card.dataset.category || '';
            const cardStatus = card.dataset.status || '';
            
            const userMatch = userFilter === '' || cardUserId.includes(userFilter);
            const categoryMatch = categoryFilter === '' || cardCategory === categoryFilter;
            const statusMatch = statusFilter === '' || cardStatus === statusFilter;
            
            if (userMatch && categoryMatch && statusMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Sort requests based on selected option
    function sortRequests() {
        const sortOption = document.getElementById('requestSortOption').value;
        const container = document.getElementById('allRequestsContainer');
        const requestCards = Array.from(container.querySelectorAll('.request-card'));
        
        // Sort based on selected option
        switch(sortOption) {
            case 'newest':
                requestCards.sort((a, b) => parseInt(b.dataset.timestamp) - parseInt(a.dataset.timestamp));
                break;
            case 'oldest':
                requestCards.sort((a, b) => parseInt(a.dataset.timestamp) - parseInt(b.dataset.timestamp));
                break;
            case 'popular':
                // Sort by number of responses (to be implemented)
                break;
        }
        
        // Re-append sorted cards
        container.innerHTML = '';
        requestCards.forEach(card => {
            container.appendChild(card);
        });
    }

    // Filter responses based on selected filters
    function filterResponses() {
        const requestFilter = document.getElementById('responseRequestFilter').value.toLowerCase();
        const userFilter = document.getElementById('responseUserFilter').value.toLowerCase();
        
        const responseCards = document.querySelectorAll('#responsesContainer .feedback-card');
        
        responseCards.forEach(card => {
            const cardRequestId = card.dataset.requestId.toLowerCase();
            const cardUserId = card.dataset.userId.toLowerCase();
            
            const requestMatch = requestFilter === '' || cardRequestId.includes(requestFilter);
            const userMatch = userFilter === '' || cardUserId.includes(userFilter);
            
            if (requestMatch && userMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Sort responses based on selected option
    function sortResponses() {
        const sortOption = document.getElementById('responseSortOption').value;
        const container = document.getElementById('responsesContainer');
        const responseCards = Array.from(container.querySelectorAll('.feedback-card'));
        
        // Sort based on selected option
        switch(sortOption) {
            case 'newest':
                responseCards.sort((a, b) => parseInt(b.dataset.timestamp) - parseInt(a.dataset.timestamp));
                break;
            case 'oldest':
                responseCards.sort((a, b) => parseInt(a.dataset.timestamp) - parseInt(b.dataset.timestamp));
                break;
            case 'rating':
                responseCards.sort((a, b) => {
                    // Handle both numeric and text ratings
                    const ratingA = a.dataset.rating || '';
                    const ratingB = b.dataset.rating || '';
                    
                    // If ratings are numeric
                    if (!isNaN(ratingA) && !isNaN(ratingB)) {
                        return parseInt(ratingB) - parseInt(ratingA);
                    }
                    
                    // If ratings are text
                    const ratingValues = {
                        '': 0,
                        'Poor': 1,
                        'Fair': 2,
                        'Good': 3,
                        'Very Good': 4,
                        'Excellent': 5
                    };
                    
                    return (ratingValues[ratingB] || 0) - (ratingValues[ratingA] || 0);
                });
                break;
        }
        
        // Re-append sorted cards
        container.innerHTML = '';
        responseCards.forEach(card => {
            container.appendChild(card);
        });
    }

    // Load all active requests
    async function loadAllActiveRequests() {
        const requestsContainer = document.getElementById('requestsContainer') || document.getElementById('activeRequestsContainer');
        if (requestsContainer) {
            requestsContainer.innerHTML = '<div class="loading">Loading active requests...</div>';
        }

        try {
            const response = await fetch(`${API_URL}/requests/active`);
            
            // Check if response is ok
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("The API endpoint was not found. Please check server configuration.");
                } else if (response.status >= 500) {
                    throw new Error("Server error. Please contact administrator.");
                } else {
                    throw new Error(`Server returned ${response.status} ${response.statusText}`);
                }
            }
            
            const data = await response.json();
            
            if (data.success) {
                displayActiveRequests(data.requests);
                showNotification('Requests loaded successfully', 'success');
            } else {
                showNotification(data.error || 'Error loading active requests', 'error');
                if (requestsContainer) {
                    requestsContainer.innerHTML = '<p class="error-text">Error loading requests. Please try again later.</p>';
                }
            }
        } catch (error) {
            console.error('Error loading active requests:', error);
            
            // Provide specific error message based on the error type
            let errorMessage = 'Error connecting to the server. Please ensure the server is running.';
            if (error.message.includes('API endpoint was not found')) {
                errorMessage = 'The request endpoint is not available. Please check server configuration.';
            }
            
            showNotification(errorMessage, 'error');
            
            if (requestsContainer) {
                requestsContainer.innerHTML = `<p class="error-text">${errorMessage}</p>`;
            }
        }
    }

    // Display active requests in container
    function displayActiveRequests(requests) {
        const container = document.getElementById('requestsContainer') || document.getElementById('activeRequestsContainer');
        if (!container) return;
        
        if (requests.length === 0) {
            container.innerHTML = '<p class="placeholder-text">No active feedback requests available</p>';
            return;
        }
        
        container.innerHTML = '';
        
        // Filter active requests only and sort by newest first
        const activeRequests = requests.filter(request => request.status === 'active');
        activeRequests.sort((a, b) => b.timestamp - a.timestamp);
        
        activeRequests.forEach(request => {
            const requestCard = createRequestCard(request);
            container.appendChild(requestCard);
        });
        
        // Add event listeners for respond buttons
        container.querySelectorAll('.respond-btn').forEach(button => {
            button.addEventListener('click', () => {
                const requestId = button.dataset.requestId;
                const requestTitle = button.dataset.requestTitle;
                const collectNumeric = button.dataset.numeric === 'true';
                const collectText = button.dataset.text === 'true';
                
                showResponseForm(requestId, requestTitle, collectNumeric, collectText);
            });
        });
        
        // Add event listeners for view details buttons
        container.querySelectorAll('.view-request-btn').forEach(button => {
            button.addEventListener('click', () => {
                const requestId = button.dataset.requestId;
                viewRequestDetails(requestId);
            });
        });
    }

    // Create feedback card element with edit capability
    function createFeedbackCard(feedback) {
        const card = document.createElement('div');
        card.className = 'feedback-card';
        
        // Add data attributes for filtering and sorting
        card.dataset.userId = feedback.userId;
        card.dataset.timestamp = feedback.timestamp;
        card.dataset.rating = feedback.rating || 0;
        if (feedback.category) card.dataset.category = feedback.category;
        
        const date = new Date(feedback.timestamp).toLocaleString();
        
        // Build tags HTML if they exist
        let tagsHtml = '';
        if (feedback.tags && feedback.tags.length > 0) {
            tagsHtml = `<div class="tags">
                ${feedback.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>`;
        }
        
        // Build category HTML if it exists
        let categoryHtml = feedback.category ? `<span class="category">${feedback.category}</span>` : '';
        
        // Determine if this is the current user's feedback to enable editing
        const currentUser = document.getElementById('currentUserId') ? document.getElementById('currentUserId').value : '';
        const isOwnFeedback = currentUser && currentUser === feedback.userId;
        
        // Add edit button if it's the user's own feedback
        let editButtonHtml = '';
        if (isOwnFeedback) {
            editButtonHtml = `<button class="btn-small edit-feedback-btn" data-feedback-id="${feedback.id || ''}">Edit</button>`;
        }
        
        card.innerHTML = `
            <div class="feedback-header">
                <h3>From: ${feedback.userId}</h3>
                <div class="feedback-meta">
                    ${categoryHtml}
                    ${feedback.rating ? `<span class="rating">${feedback.rating}</span>` : ''}
                    ${editButtonHtml}
                </div>
            </div>
            <p>${feedback.message}</p>
            ${tagsHtml}
            <p class="timestamp">${date}</p>
        `;
        
        // Add edit functionality
        if (isOwnFeedback) {
            const editBtn = card.querySelector('.edit-feedback-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    showEditFeedbackForm(feedback);
                });
            }
        }
        
        return card;
    }

    // Show edit feedback form
    function showEditFeedbackForm(feedback) {
        // Create modal for editing
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Edit Your Feedback</h2>
                <form id="editFeedbackForm">
                    <input type="hidden" id="editFeedbackId" value="${feedback.id || ''}">
                    
                    <div class="form-group">
                        <label for="editMessage">Feedback Message</label>
                        <textarea id="editMessage" required>${feedback.message}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="editCategory">Category</label>
                        <select id="editCategory">
                            <option value="">Select Category</option>
                            <option value="product" ${feedback.category === 'product' ? 'selected' : ''}>Product</option>
                            <option value="service" ${feedback.category === 'service' ? 'selected' : ''}>Service</option>
                            <option value="website" ${feedback.category === 'website' ? 'selected' : ''}>Website</option>
                            <option value="app" ${feedback.category === 'app' ? 'selected' : ''}>Application</option>
                            <option value="support" ${feedback.category === 'support' ? 'selected' : ''}>Customer Support</option>
                            <option value="other" ${feedback.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="editTags">Tags (comma separated)</label>
                        <input type="text" id="editTags" value="${feedback.tags ? feedback.tags.join(', ') : ''}">
                    </div>
                    
                    <div class="form-buttons">
                        <button type="button" class="btn-secondary" id="cancelEdit">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Handle close modal
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('#cancelEdit');
        
        const closeModal = () => {
            modal.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Handle form submission
        const editForm = modal.querySelector('#editFeedbackForm');
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const feedbackId = document.getElementById('editFeedbackId').value;
            const message = document.getElementById('editMessage').value.trim();
            const category = document.getElementById('editCategory').value;
            const tagsInput = document.getElementById('editTags').value;
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
            
            if (!message) {
                showNotification('Please enter a feedback message', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/feedback/edit`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        feedbackId,
                        userId: feedback.userId,
                        message,
                        category,
                        tags
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    closeModal();
                    showNotification('Feedback updated successfully!', 'success');
                    
                    // Refresh feedback data
                    if (window.location.pathname.includes('/view.html')) {
                        loadBlockchainData();
                    } else if (window.location.pathname.includes('/dashboard.html')) {
                        loadUserDashboardData();
                    }
                } else {
                    showNotification(data.error || 'Failed to update feedback', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Failed to connect to the server', 'error');
            }
        });
    }
}); 