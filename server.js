import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ESM file URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const httpServer = createServer(app);

const messages = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Return all chat messages
app.get('/messages', (req, res) => {
    res.json(messages);
});

// Add a new chat message
app.post('/messages', (req, res) => {
    const { username, message } = req.body;
    messages.push({ username, message });

    res.sendStatus(200);
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});