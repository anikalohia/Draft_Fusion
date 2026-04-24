import { Document } from '../Models/Document.js';

const roomUsers = {};

export const setupCollaboration = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join_document', async (data) => {
            // handle both old format (string) and new format (object) for compatibility
            const documentId = typeof data === 'string' ? data : data.documentId;
            const user = typeof data === 'object' ? data.user : null;
            
            socket.join(documentId);
            console.log(`User ${socket.id} joined document ${documentId}`);
            
            if (user) {
                socket.data.userId = user.id;
                socket.data.username = user.username;
                socket.data.documentId = documentId;

                if (!roomUsers[documentId]) {
                    roomUsers[documentId] = [];
                }
                
                const existingUserIndex = roomUsers[documentId].findIndex(u => u.id === user.id);
                if (existingUserIndex === -1) {
                    // Assign a random bold color for neobrutalism
                    const colors = ['#FF4D4D', '#4D7CFE', '#FFD700', '#00FF00', '#FF00FF', '#00FFFF'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    roomUsers[documentId].push({ id: user.id, username: user.username, color });
                }

                // Send current users to everyone in the room
                io.to(documentId).emit('active_users', roomUsers[documentId]);
            }
        });

        socket.on('document_change', (data) => {
            const { documentId, content } = data;
            socket.to(documentId).emit('receive_change', content);
        });

        socket.on('cursor_update', (data) => {
            const { documentId, cursorPosition, userId, userName, color } = data;
            // Broadcast cursor to everyone EXCEPT the sender
            socket.to(documentId).emit('receive_cursor', { cursorPosition, userId, userName, color });
        });

        socket.on('typing', (data) => {
            const { documentId, userId, username } = data;
            socket.to(documentId).emit('user_typing', { userId, username });
        });

        socket.on('stop_typing', (data) => {
            const { documentId, userId } = data;
            socket.to(documentId).emit('user_stopped_typing', { userId });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            const documentId = socket.data.documentId;
            const userId = socket.data.userId;
            
            if (documentId && roomUsers[documentId]) {
                roomUsers[documentId] = roomUsers[documentId].filter(u => u.id !== userId);
                io.to(documentId).emit('active_users', roomUsers[documentId]);
            }
        });
    });
};
