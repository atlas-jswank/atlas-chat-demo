import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

// Convert ESM file URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const httpServer = createServer(app);
const socket = new Server(httpServer);

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

    // Broadcast new chat to all clients
    socket.emit('chat-message', {
        username: username,
        message: message
    })

    res.sendStatus(200);
});

socket.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);
});

socket.on('disconnect', (socket) => {
    console.log('A user disconnected: ' + socket.id);
});

// Socket.IO connection handling
socket.on('connection', (connection) => {
    console.log('A user connected:', socket.id);

    // Handle new user joining
    connection.on('user-join', (username) => {
        // Notify everyone about the new user
        messages.push({ type: 'system', message: `${username} joined the chat` });
        socket.emit('chat-message', { type: 'system', message: `${username} joined the chat` })
    });

    connection.on('user-left', (username) => {
        messages.push({ type: 'system', message: `${username} left the chat` });
        socket.emit('chat-message', { type: 'system', message: `${username} left the chat` })
    });

    // Handle typing indicator
    connection.on('typing', (username) => {
        connection.broadcast.emit('typing', username);
    });

    connection.on('stop-typing', (username) => {
        connection.broadcast.emit('stop-typing', username);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});