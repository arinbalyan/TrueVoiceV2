const express = require('express');
const router = express.Router();
const Blockchain = require('../blockchain/Blockchain');

// Initialize blockchain
const blockchain = new Blockchain();

// POST - Submit feedback
router.post('/submit', (req, res) => {
    const { userId, message, rating, category, priority, tags } = req.body;
    
    if (!userId || !message) {
        return res.status(400).json({ 
            success: false,
            error: 'Missing required fields' 
        });
    }

    // Add feedback to blockchain
    const feedback = blockchain.addFeedback(message, userId, rating, category, priority, tags);
    
    // Mine the block with the new feedback
    const block = blockchain.minePendingFeedbacks();

    res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        feedback,
        blockHash: block ? block.hash : null
    });
});

// POST - Create feedback request
router.post('/request', (req, res) => {
    const { 
        userId, title, description, category, expiryDate, 
        tags, collectNumericRating, collectTextRating, customQuestions 
    } = req.body;
    
    if (!userId || !title || !description) {
        return res.status(400).json({ 
            success: false,
            error: 'Missing required fields' 
        });
    }

    // Add request to blockchain
    const request = blockchain.addFeedbackRequest(
        userId, title, description, category, expiryDate,
        tags, collectNumericRating, collectTextRating, customQuestions
    );
    
    // Mine the block with the new request
    const block = blockchain.minePendingFeedbacks();

    res.status(201).json({
        success: true,
        message: 'Feedback request created successfully',
        request,
        blockHash: block ? block.hash : null
    });
});

// POST - Submit response to a feedback request
router.post('/respond', (req, res) => {
    console.log('Received response submission:', req.body);
    
    try {
        const { requestId, userId, message, rating, answers } = req.body;
        
        if (!requestId || !userId || !message) {
            console.log('Missing required fields:', { requestId, userId, message });
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields' 
            });
        }
        
        // Check if request exists
        const request = blockchain.getRequestById(requestId);
        if (!request) {
            console.log(`Request not found: ${requestId}`);
            return res.status(404).json({
                success: false,
                error: 'Feedback request not found'
            });
        }
        
        // Check if request is active
        if (request.status !== 'active') {
            console.log(`Request ${requestId} is ${request.status}, not accepting responses`);
            return res.status(400).json({
                success: false,
                error: `Feedback request is ${request.status}, not accepting responses`
            });
        }
        
        // Add response to blockchain
        const response = blockchain.addRequestResponse(requestId, userId, message, rating, answers);
        
        // Mine the block with the new response
        const block = blockchain.minePendingFeedbacks();
        
        console.log('Response submitted successfully:', response);
        
        res.status(201).json({
            success: true,
            message: 'Response submitted successfully',
            response,
            blockHash: block ? block.hash : null
        });
    } catch (error) {
        console.error('Error in /respond endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while processing response'
        });
    }
});

// PUT - Update request status
router.put('/request/:requestId/status', (req, res) => {
    const { requestId } = req.params;
    const { status, userId } = req.body;
    
    if (!status || !userId) {
        return res.status(400).json({ 
            success: false,
            error: 'Missing required fields' 
        });
    }
    
    // Validate status
    if (!['active', 'closed', 'expired'].includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid status. Must be active, closed, or expired'
        });
    }
    
    // Check if request exists
    const request = blockchain.getRequestById(requestId);
    if (!request) {
        return res.status(404).json({
            success: false,
            error: 'Feedback request not found'
        });
    }
    
    // Check if user is the owner
    if (request.userId !== userId) {
        return res.status(403).json({
            success: false,
            error: 'Only the request creator can update status'
        });
    }
    
    // Update status
    const updated = blockchain.updateRequestStatus(requestId, status);
    
    // Mine the block with the status update
    const block = blockchain.minePendingFeedbacks();

    res.status(200).json({
        success: updated,
        message: updated ? 'Status updated successfully' : 'Failed to update status',
        blockHash: block ? block.hash : null
    });
});

// GET - Retrieve all blockchain data
router.get('/chain', (req, res) => {
    const chain = blockchain.chain;
    res.json({
        success: true,
        chain
    });
});

// GET - Validate blockchain integrity
router.get('/validate', (req, res) => {
    const isValid = blockchain.isChainValid();
    res.json({
        success: true,
        isValid
    });
});

// GET - Retrieve all feedbacks
router.get('/feedbacks', (req, res) => {
    const feedbacks = blockchain.getAllFeedbacks();
    res.json({
        success: true,
        feedbacks
    });
});

// GET - Retrieve all requests
router.get('/requests', (req, res) => {
    const requests = blockchain.getAllRequests();
    res.json({
        success: true,
        requests
    });
});

// GET - Retrieve active requests
router.get('/requests/active', (req, res) => {
    const allRequests = blockchain.getAllRequests();
    const activeRequests = allRequests.filter(request => request.status === 'active');
    
    res.json({
        success: true,
        requests: activeRequests
    });
});

// GET - Retrieve all responses
router.get('/responses', (req, res) => {
    const responses = blockchain.getAllResponses();
    res.json({
        success: true,
        responses
    });
});

// GET - Retrieve feedbacks by userId
router.get('/feedbacks/user/:userId', (req, res) => {
    const { userId } = req.params;
    const feedbacks = blockchain.getFeedbacksByUser(userId);
    
    res.json({
        success: true,
        userId,
        feedbacks
    });
});

// GET - Retrieve requests by userId
router.get('/requests/user/:userId', (req, res) => {
    const { userId } = req.params;
    const requests = blockchain.getRequestsByUser(userId);
    
    res.json({
        success: true,
        userId,
        requests
    });
});

// GET - Retrieve responses for a specific request
router.get('/responses/request/:requestId', (req, res) => {
    const { requestId } = req.params;
    const responses = blockchain.getResponsesForRequest(requestId);
    
    res.json({
        success: true,
        requestId,
        responses
    });
});

// GET - Retrieve responses by user
router.get('/responses/user/:userId', (req, res) => {
    const { userId } = req.params;
    const responses = blockchain.getResponsesByUser(userId);
    
    res.json({
        success: true,
        userId,
        responses
    });
});

// GET - Retrieve responses for user's requests
router.get('/responses/for-user/:userId', (req, res) => {
    const { userId } = req.params;
    const responses = blockchain.getResponsesForUserRequests(userId);
    
    res.json({
        success: true,
        userId,
        responses
    });
});

// GET - Get detailed info for a specific request
router.get('/request/:requestId', (req, res) => {
    const { requestId } = req.params;
    const request = blockchain.getRequestById(requestId);
    
    if (!request) {
        return res.status(404).json({
            success: false,
            error: 'Feedback request not found'
        });
    }
    
    // Get responses for this request
    const responses = blockchain.getResponsesForRequest(requestId);
    
    res.json({
        success: true,
        request,
        responses
    });
});

// GET - Get user stats
router.get('/stats/:userId', (req, res) => {
    const { userId } = req.params;
    const stats = blockchain.getUserStats(userId);
    
    res.json({
        success: true,
        userId,
        stats
    });
});

module.exports = router; 