# TrueVoice - Decentralized Feedback System

TrueVoice is a blockchain-based feedback system that ensures all feedback and responses are permanently recorded and cannot be altered. The platform allows users to share thoughts, request targeted feedback, and build a transparent feedback ecosystem.

## Features

### Core Blockchain Features
- **Immutable Records**: Once recorded, feedback cannot be altered or deleted
- **Blockchain Security**: SHA256 hashing and proof-of-work ensure data integrity
- **Transparent Ledger**: All feedback is publicly viewable and verifiable
- **Block Mining**: Automatic mining of blocks after transactions are added to the pending queue
- **Chain Validation**: Built-in integrity checks to verify the blockchain hasn't been tampered with

### Feedback System Features
- **Multi-purpose Feedback**: Submit general feedback or respond to specific requests
- **Flexible Rating Options**: Numeric (1-5) or text-based ratings
- **Categorization**: Organize feedback by categories (product, service, website, etc.)
- **Tagging System**: Add searchable tags to feedback
- **Privacy Options**: Submit feedback anonymously or with user identification
- **Feedback Editing**: Users can edit their own previously submitted feedback
- **Search & Filter**: Find feedback by user, category, rating, or date

### Request System Features
- **Structured Feedback Requests**: Create detailed requests for targeted feedback
- **Custom Questions**: Add specific questions to collect the exact information needed
- **Response Collection**: Gather structured responses to feedback requests
- **Request Status Management**: Mark requests as active, closed, or expired
- **Response Analytics**: View statistics and patterns from collected feedback
- **User-specific Views**: Different views for feedback requesters and responders

### User Experience
- **Personal Dashboard**: Track all feedback activities, requests, and responses
- **Real-time Updates**: Feedback appears immediately after submission
- **Responsive Design**: Works across desktop and mobile devices
- **Notification System**: Alert users of feedback responses or status changes

## Blockchain Structure

### Sample Block Structure

```json
{
  "index": 3,
  "timestamp": 1677529402718,
  "data": [
    {
      "type": "feedback",
      "userId": "alice123",
      "message": "The new UI is much more intuitive than before!",
      "rating": 5,
      "category": "website",
      "tags": ["design", "usability"],
      "timestamp": 1677529382718
    },
    {
      "type": "request",
      "requestId": "req_1677528902718_8392",
      "userId": "bob456",
      "title": "Feedback for new mobile app",
      "description": "Looking for user feedback on our beta mobile app",
      "category": "app",
      "collectNumericRating": true,
      "collectTextRating": false,
      "customQuestions": [
        {"id": "q1", "question": "How easy was the onboarding process?"},
        {"id": "q2", "question": "What features would you like to see added?"}
      ],
      "status": "active",
      "timestamp": 1677529002718
    },
    {
      "type": "response",
      "requestId": "req_1677528902718_8392",
      "userId": "charlie789",
      "message": "App is great but the onboarding could be simpler.",
      "rating": 4,
      "answers": [
        {"questionId": "q1", "answer": "Somewhat confusing"},
        {"questionId": "q2", "answer": "Dark mode and offline capabilities"}
      ],
      "timestamp": 1677529302718
    }
  ],
  "previousHash": "00a7c3e170590d2954d83022b6d0bd63174c195351dbcf5f3738134e9dc73829",
  "hash": "00e83cb6df3abb54f92c5d9055f9682e2ee0a1b027c700243fc3b2ff8f52aac1",
  "nonce": 7392
}
```

### Transaction Types

1. **Feedback**: General feedback submissions
2. **Request**: Requests for specific feedback
3. **Response**: Responses to feedback requests
4. **Status Update**: Updates to request statuses

## API Endpoints

### Blockchain Data
- `GET /api/chain` - Retrieve the full blockchain
- `GET /api/validate` - Validate blockchain integrity

### Feedback
- `GET /api/feedbacks` - Get all feedbacks
- `GET /api/feedbacks/user/:userId` - Get feedbacks by user ID
- `POST /api/submit` - Submit new feedback
- `POST /api/feedback/edit` - Edit existing feedback

### Requests
- `GET /api/requests` - Get all feedback requests
- `GET /api/requests/active` - Get all active feedback requests
- `GET /api/requests/user/:userId` - Get requests by user ID
- `GET /api/request/:requestId` - Get details for a specific request
- `POST /api/request` - Create a new feedback request
- `PUT /api/request/:requestId/status` - Update request status

### Responses
- `GET /api/responses` - Get all responses
- `GET /api/responses/request/:requestId` - Get responses for a specific request
- `GET /api/responses/user/:userId` - Get responses by user ID
- `GET /api/responses/for-user/:userId` - Get responses to a user's requests
- `POST /api/respond` - Submit a response to a feedback request

### Analytics
- `GET /api/stats/:userId` - Get user statistics

## Technical Architecture

### Client-Side
- HTML5, CSS3, and vanilla JavaScript
- Responsive design using flexbox and CSS grid
- Event-driven UI updates

### Server-Side
- Node.js with Express.js
- RESTful API architecture
- Error handling middleware

### Blockchain Implementation
- Custom blockchain using SHA256 hashing
- Proof-of-work consensus algorithm
- In-memory storage (can be extended to persistent storage)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/truevoice.git
cd truevoice
```

2. Install dependencies:
```bash
cd server
npm install
```

3. Start the server:
```bash
node server.js
```

4. Open `http://localhost:3000` in your web browser

## How to Use

### Submitting General Feedback

1. Navigate to the "Give Feedback" page from the navigation menu
2. Enter your nickname (or leave blank for anonymous submission)
3. Write your feedback message in the text area
4. (Optional) Select a rating from 1-5 stars
5. (Optional) Choose a category for your feedback
6. (Optional) Add relevant tags separated by commas
7. Click "Submit Feedback"

Your feedback will be recorded on the blockchain and appear in the "Recent Feedbacks" section.

### Creating a Feedback Request

1. Navigate to the "Request Feedback" page
2. Enter your user ID (required to manage the request later)
3. Provide a title and description for your feedback request
4. Set the expiry date (if applicable)
5. Configure data collection options:
   - Enable/disable numeric ratings
   - Enable/disable text ratings
   - Add custom questions by clicking "Add Question"
6. Click "Submit Request"

Your request will be recorded on the blockchain and be available for responses.

### Responding to Feedback Requests

1. Navigate to the "Give Feedback" page
2. Scroll down to "Active Feedback Requests"
3. Review the available requests
4. Click "Respond" on the request you want to answer
5. Enter your nickname (or leave blank for anonymous)
6. Provide your feedback in the message field
7. Answer any custom questions included in the request
8. Provide ratings if requested
9. Click "Submit Response"

### Using Your Dashboard

1. Navigate to the "Dashboard" page
2. Enter your user ID to view your personal dashboard
3. Explore your data through the following tabs:
   - **Your Feedbacks**: View all feedback you've submitted
   - **Your Requests**: Manage feedback requests you've created
   - **Responses to Your Requests**: View responses to your feedback requests
   - **Your Responses**: See your responses to others' requests

### Managing Feedback Requests

1. From your dashboard, navigate to "Your Requests"
2. For each request, you can:
   - View detailed responses by clicking "View Responses"
   - Change request status (Active/Closed/Expired) using the status dropdown
   - See response statistics and analytics

### Exploring All Feedback

1. Navigate to the "View Feedbacks" page
2. Use the filter options to search by:
   - User ID
   - Category
   - Rating
   - Date range
3. Sort results by newest, oldest, or highest rating
4. Click on individual feedback items to see more details

## Future Enhancements

- Persistent storage with MongoDB or similar database
- User authentication with JWT
- Advanced analytics dashboard
- Email notifications for feedback responses
- Mobile app version

## License

MIT 