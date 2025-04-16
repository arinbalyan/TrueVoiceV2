const crypto = require('crypto-js');

class Block {
    constructor(index, timestamp, data, userId, rating, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.userId = userId;
        this.rating = rating;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return crypto.SHA256(
            this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.data) +
            this.userId +
            this.rating +
            this.nonce
        ).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }
}

module.exports = Block; 