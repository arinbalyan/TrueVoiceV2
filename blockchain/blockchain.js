const crypto = require('crypto-js');
const Block = require('./Block');

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingFeedbacks = [];
        this.pendingRequests = [];
        this.pendingResponses = [];
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), "Genesis Block", "System", 0, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addFeedback(message, userId, rating = null, category = null, priority = null, tags = []) {
        const feedback = {
            type: 'feedback',
            message,
            userId,
            rating,
            category,
            priority,
            tags: Array.isArray(tags) ? tags : [],
            timestamp: Date.now()
        };
        
        this.pendingFeedbacks.push(feedback);
        return feedback;
    }
    
    addFeedbackRequest(userId, title, description, category = null, expiryDate = null, tags = [], collectNumericRating = true, collectTextRating = false, customQuestions = []) {
        const requestId = `req_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const request = {
            type: 'request',
            requestId,
            userId,
            title,
            description,
            category,
            expiryDate: expiryDate ? new Date(expiryDate).getTime() : null,
            tags: Array.isArray(tags) ? tags : [],
            collectNumericRating,
            collectTextRating,
            customQuestions: Array.isArray(customQuestions) ? customQuestions : [],
            status: 'active',
            timestamp: Date.now()
        };
        
        this.pendingRequests.push(request);
        return request;
    }
    
    addRequestResponse(requestId, userId, message, rating = null, answers = []) {
        const response = {
            type: 'response',
            requestId,
            userId,
            message,
            rating,
            answers,
            timestamp: Date.now()
        };
        
        this.pendingResponses.push(response);
        return response;
    }
    
    updateRequestStatus(requestId, status) {
        // First check pending requests
        const pendingRequestIndex = this.pendingRequests.findIndex(r => r.requestId === requestId);
        if (pendingRequestIndex !== -1) {
            this.pendingRequests[pendingRequestIndex].status = status;
            return true;
        }
        
        // Then check requests in the chain
        for (let i = 1; i < this.chain.length; i++) {
            if (Array.isArray(this.chain[i].data)) {
                for (let j = 0; j < this.chain[i].data.length; j++) {
                    const item = this.chain[i].data[j];
                    if (item.type === 'request' && item.requestId === requestId) {
                        // For blockchain immutability, we don't actually modify the chain
                        // Instead we add a status update transaction
                        const statusUpdate = {
                            type: 'status_update',
                            requestId,
                            newStatus: status,
                            previousStatus: item.status,
                            timestamp: Date.now()
                        };
                        this.pendingFeedbacks.push(statusUpdate);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    minePendingFeedbacks() {
        // Combine all pending items
        const pendingItems = [
            ...this.pendingFeedbacks,
            ...this.pendingRequests,
            ...this.pendingResponses
        ];
        
        // If nothing to mine, return
        if (pendingItems.length === 0) {
            return null;
        }
        
        const block = new Block(
            this.chain.length,
            Date.now(),
            pendingItems,
            "Miner",
            0,
            this.getLatestBlock().hash
        );
        
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        
        // Clear pending queues
        this.pendingFeedbacks = [];
        this.pendingRequests = [];
        this.pendingResponses = [];
        
        return block;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Validate current block hash
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Validate chain link
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    getAllFeedbacks() {
        const feedbacks = [];
        for (let i = 1; i < this.chain.length; i++) {
            if (Array.isArray(this.chain[i].data)) {
                feedbacks.push(...this.chain[i].data.filter(item => item.type === 'feedback'));
            }
        }
        return feedbacks;
    }
    
    getAllRequests() {
        const requests = [];
        for (let i = 1; i < this.chain.length; i++) {
            if (Array.isArray(this.chain[i].data)) {
                requests.push(...this.chain[i].data.filter(item => item.type === 'request'));
            }
        }
        
        // Apply status updates
        const statusUpdates = this.getAllStatusUpdates();
        requests.forEach(request => {
            const updates = statusUpdates.filter(update => update.requestId === request.requestId)
                .sort((a, b) => b.timestamp - a.timestamp);
            
            if (updates.length > 0) {
                request.status = updates[0].newStatus;
            }
        });
        
        return requests;
    }
    
    getAllResponses() {
        const responses = [];
        for (let i = 1; i < this.chain.length; i++) {
            if (Array.isArray(this.chain[i].data)) {
                responses.push(...this.chain[i].data.filter(item => item.type === 'response'));
            }
        }
        return responses;
    }
    
    getAllStatusUpdates() {
        const updates = [];
        for (let i = 1; i < this.chain.length; i++) {
            if (Array.isArray(this.chain[i].data)) {
                updates.push(...this.chain[i].data.filter(item => item.type === 'status_update'));
            }
        }
        return updates;
    }
    
    getFeedbacksByUser(userId) {
        const allFeedbacks = this.getAllFeedbacks();
        return allFeedbacks.filter(feedback => feedback.userId === userId);
    }
    
    getRequestsByUser(userId) {
        const allRequests = this.getAllRequests();
        return allRequests.filter(request => request.userId === userId);
    }
    
    getResponsesForRequest(requestId) {
        const allResponses = this.getAllResponses();
        return allResponses.filter(response => response.requestId === requestId);
    }
    
    getResponsesByUser(userId) {
        const allResponses = this.getAllResponses();
        return allResponses.filter(response => response.userId === userId);
    }
    
    getResponsesForUserRequests(userId) {
        const userRequests = this.getRequestsByUser(userId);
        const requestIds = userRequests.map(req => req.requestId);
        const allResponses = this.getAllResponses();
        
        return allResponses.filter(response => requestIds.includes(response.requestId));
    }
    
    getRequestById(requestId) {
        const allRequests = this.getAllRequests();
        return allRequests.find(request => request.requestId === requestId) || null;
    }
    
    getLatestFeedbacks(count = 10) {
        const allFeedbacks = this.getAllFeedbacks();
        return allFeedbacks.slice(-count);
    }
    
    getUserStats(userId) {
        const feedbacksGiven = this.getFeedbacksByUser(userId).length;
        const requestsCreated = this.getRequestsByUser(userId).length;
        const responsesToUserRequests = this.getResponsesForUserRequests(userId);
        
        let totalRating = 0;
        let ratingCount = 0;
        
        responsesToUserRequests.forEach(response => {
            if (response.rating !== null && !isNaN(response.rating)) {
                totalRating += parseFloat(response.rating);
                ratingCount++;
            }
        });
        
        const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "N/A";
        
        return {
            feedbacksGiven,
            requestsCreated,
            responsesReceived: responsesToUserRequests.length,
            avgRatingReceived: avgRating
        };
    }
}

module.exports = Blockchain; 