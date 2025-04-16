const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.use('/api', routes);

// Error handling
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Catch-all route
app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../pages/error.html'));
});

// Start server
app.listen(port, () => {
    console.log(`TrueVoice server running on port ${port}`);
    console.log(`Server URL: http://localhost:${port}`);
}); 