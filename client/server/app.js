import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { signup, login, getProfile } from './controllers/authController.js';
import { createDocument, getDocument, getUserDocuments, updateDocument, deleteDocument } from './controllers/documentController.js';
import { shareWithUser, removeSharedUser, getSharedUsers, generateShareLink, revokeShareLink, accessViaShareLink } from './controllers/shareController.js';
import { authMiddleware } from './passport/authMiddleware.js';
import { setupCollaboration } from './sockets/collaboration.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/profile', authMiddleware, getProfile);

// Document Routes (shared/token route MUST come before :id to avoid being caught by wildcard)
app.get('/api/docs/shared/:shareToken', authMiddleware, accessViaShareLink);
app.post('/api/docs', authMiddleware, createDocument);
app.get('/api/docs/:id', authMiddleware, getDocument);
app.get('/api/docs/user/:userId', authMiddleware, getUserDocuments);
app.put('/api/docs/:id', authMiddleware, updateDocument);
app.delete('/api/docs/:id', authMiddleware, deleteDocument);

// Share Routes
app.post('/api/docs/:id/share', authMiddleware, shareWithUser);
app.delete('/api/docs/:id/share/:userId', authMiddleware, removeSharedUser);
app.get('/api/docs/:id/share', authMiddleware, getSharedUsers);
app.post('/api/docs/:id/generate-link', authMiddleware, generateShareLink);
app.delete('/api/docs/:id/revoke-link', authMiddleware, revokeShareLink);

// Basic Test Route
app.get('/', (req, res) => {
    res.send('Draft Fusion Server is Running');
});

// Setup Sockets
setupCollaboration(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
