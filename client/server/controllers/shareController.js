import crypto from 'crypto';
import { Document } from '../Models/Document.js';
import { user as User } from '../Models/user.js';

// Helper: verify requester is the document owner
const verifyOwner = async (docId, userId) => {
    const doc = await Document.findById(docId);
    if (!doc) return { error: 'Document not found', status: 404 };
    if (doc.owner.toString() !== userId) return { error: 'Only the document owner can manage sharing', status: 403 };
    return { doc };
};

// POST /api/docs/:id/share — Share with a specific user by email
export const shareWithUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, permission = 'editor' } = req.body;

        const { doc, error, status } = await verifyOwner(id, req.userId);
        if (error) return res.status(status).json({ success: false, message: error });

        // Find target user by email
        const targetUser = await User.findOne({ email });
        if (!targetUser) return res.status(404).json({ success: false, message: 'No registered user found with this email' });

        // Don't allow sharing with self
        if (targetUser._id.toString() === req.userId) {
            return res.status(400).json({ success: false, message: 'You cannot share a document with yourself' });
        }

        // Check if already shared
        const alreadyShared = doc.sharedWith.some(s => s.user.toString() === targetUser._id.toString());
        if (alreadyShared) {
            return res.status(400).json({ success: false, message: 'Document is already shared with this user' });
        }

        // Add to sharedWith and collaborators (for backward compatibility with socket rooms)
        doc.sharedWith.push({ user: targetUser._id, permission });
        if (!doc.collaborators.some(c => c.toString() === targetUser._id.toString())) {
            doc.collaborators.push(targetUser._id);
        }
        await doc.save();

        // Return populated shared user info
        const updatedDoc = await Document.findById(id).populate('sharedWith.user', 'username email');
        res.status(200).json({ success: true, sharedWith: updatedDoc.sharedWith });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/docs/:id/share/:userId — Remove a shared user
export const removeSharedUser = async (req, res) => {
    try {
        const { id, userId: targetUserId } = req.params;

        const { doc, error, status } = await verifyOwner(id, req.userId);
        if (error) return res.status(status).json({ success: false, message: error });

        doc.sharedWith = doc.sharedWith.filter(s => s.user.toString() !== targetUserId);
        doc.collaborators = doc.collaborators.filter(c => c.toString() !== targetUserId);
        await doc.save();

        const updatedDoc = await Document.findById(id).populate('sharedWith.user', 'username email');
        res.status(200).json({ success: true, sharedWith: updatedDoc.sharedWith });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/docs/:id/share — Get list of shared users
export const getSharedUsers = async (req, res) => {
    try {
        const { id } = req.params;

        const { doc, error, status } = await verifyOwner(id, req.userId);
        if (error) return res.status(status).json({ success: false, message: error });

        const populatedDoc = await Document.findById(id).populate('sharedWith.user', 'username email');
        res.status(200).json({
            success: true,
            sharedWith: populatedDoc.sharedWith,
            shareToken: populatedDoc.shareToken
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/docs/:id/generate-link — Generate a secure share token
export const generateShareLink = async (req, res) => {
    try {
        const { id } = req.params;

        const { doc, error, status } = await verifyOwner(id, req.userId);
        if (error) return res.status(status).json({ success: false, message: error });

        doc.shareToken = crypto.randomBytes(32).toString('hex');
        await doc.save();

        res.status(200).json({ success: true, shareToken: doc.shareToken });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/docs/:id/revoke-link — Revoke the share link
export const revokeShareLink = async (req, res) => {
    try {
        const { id } = req.params;

        const { doc, error, status } = await verifyOwner(id, req.userId);
        if (error) return res.status(status).json({ success: false, message: error });

        doc.shareToken = null;
        await doc.save();

        res.status(200).json({ success: true, message: 'Share link revoked' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/docs/shared/:shareToken — Access doc via share token
export const accessViaShareLink = async (req, res) => {
    try {
        const { shareToken } = req.params;

        const doc = await Document.findOne({ shareToken });
        if (!doc) return res.status(404).json({ success: false, message: 'Invalid or expired share link' });

        // Auto-add user to sharedWith if not already present and not the owner
        const userId = req.userId;
        const isOwner = doc.owner.toString() === userId;
        const alreadyShared = doc.sharedWith.some(s => s.user.toString() === userId);

        if (!isOwner && !alreadyShared) {
            doc.sharedWith.push({ user: userId, permission: 'editor' });
            if (!doc.collaborators.some(c => c.toString() === userId)) {
                doc.collaborators.push(userId);
            }
            await doc.save();
        }

        res.status(200).json({ success: true, documentId: doc._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
