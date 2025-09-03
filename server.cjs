const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const EXTERNAL_API_URL = 'http://test-dev.api-eprod-solutions.com:9000/trace/orders';

app.use(cors()); // Allow all origins
app.use(express.json()); // Parse incoming JSON

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.post('/call-api', async (req, res) => {
    const data = req.body;
    console.log('🔹 Incoming Request Body:', data);
    
    if (!data || !data.licenseid || !data.guid) {
        console.log('❌ Missing required fields: licenseid or guid');
        return res.status(400).json({ error: 'Missing license or guid' });
    }
    
    const payload = {
        licenseid: data.licenseid,
        guid: data.guid
    };
    
    // Add db to payload if provided
    if (data.db) {
        payload.db = data.db;
        console.log('✅ Including db parameter in external API request:', data.db);
    }
    
    console.log('📤 Sending to External API:', EXTERNAL_API_URL);
    console.log('📦 Payload:', payload);
    
    try {
        const response = await axios.post(EXTERNAL_API_URL, payload);
        console.log('✅ Response Status Code:', response.status);
        console.log('🔁 Response Body:', response.data);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('🔥 Exception occurred:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Serve static files from the 'dist' directory when in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // Handle all other routes by serving the index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app; // Export for service wrapper