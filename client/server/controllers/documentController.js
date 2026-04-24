import { Document } from '../Models/Document.js';

export const createDocument = async (req, res) => {
    try {
        const { title, folder = "General" } = req.body;
        const newDoc = await Document.create({
            title,
            folder,
            owner: req.userId,
            content: ""
        });
        res.status(201).json({ success: true, document: newDoc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

        // Check Permissions: Owner, Collaborator, SharedWith, or Public
        const isOwner = doc.owner.toString() === req.userId;
        const isCollaborator = doc.collaborators.some(c => c.toString() === req.userId);
        const isSharedWith = doc.sharedWith.some(s => s.user.toString() === req.userId);

        if (!isOwner && !isCollaborator && !isSharedWith && !doc.isPublic) {
            return res.status(403).json({ success: false, message: "Access denied. Ask the owner for permission." });
        }

        res.status(200).json({ success: true, document: doc, isOwner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserDocuments = async (req, res) => {
    try {
        const docs = await Document.find({
            $or: [
                { owner: req.userId },
                { collaborators: req.userId },
                { 'sharedWith.user': req.userId }
            ]
        }).sort({ updatedAt: -1 });
        res.status(200).json({ success: true, documents: docs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, title, isPublic, folder } = req.body;

        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

        const isOwner = doc.owner.toString() === req.userId;
        const isCollaborator = doc.collaborators.some(c => c.toString() === req.userId);
        const sharedEntry = doc.sharedWith.find(s => s.user.toString() === req.userId);
        const isSharedWith = !!sharedEntry;

        if (!isOwner && !isCollaborator && !isSharedWith && !doc.isPublic) {
            return res.status(403).json({ success: false, message: "Permission denied" });
        }

        // If shared as viewer, deny write access
        if (sharedEntry && sharedEntry.permission === 'viewer' && !isOwner) {
            return res.status(403).json({ success: false, message: "You have view-only access" });
        }

        const updateData = { updatedAt: Date.now() };
        if (content !== undefined) updateData.content = content;
        if (title !== undefined) updateData.title = title;
        if (folder !== undefined) updateData.folder = folder;
        if (isPublic !== undefined && isOwner) updateData.isPublic = isPublic;

        const updatedDoc = await Document.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, document: updatedDoc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        await Document.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Document deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
