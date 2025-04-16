# TrueVoice - Decentralized Feedback System

TrueVoice is a decentralized feedback system built using blockchain technology. It allows users to submit feedback that is permanently recorded on the blockchain, ensuring immutability and transparency.

## Features

- Decentralized feedback storage using blockchain
- Immutable feedback records
- User authentication and feedback attribution
- Optional rating system
- Modern and minimalistic UI
- Real-time feedback updates
- Blockchain integrity validation

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Blockchain: Custom implementation with SHA256 hashing
- Cryptography: Crypto-js

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/truevoice.git
cd truevoice
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open `index.html` in your web browser

## Usage

1. Enter your User ID
2. Write your feedback message
3. (Optional) Select a rating
4. Click "Submit Feedback"

Your feedback will be recorded on the blockchain and displayed in the recent feedbacks section.

## API Endpoints

- `POST /api/feedback` - Submit new feedback
- `GET /api/feedbacks` - Get all feedbacks
- `GET /api/chain` - View the blockchain
- `GET /api/validate` - Validate blockchain integrity

## Security Features

- Cryptographic hashing using SHA256
- Proof-of-work mechanism
- Immutable feedback records
- Timestamp verification
- Blockchain integrity checks

## License

MIT 