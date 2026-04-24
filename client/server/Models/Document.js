import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    title: { type: String, default: "Untitled Document" },
    content: { type: Object, default: {} }, // Tiptap content is usually JSON
    folder: { type: String, default: "General" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, default: null },
    sharedWith: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        permission: { type: String, enum: ['viewer', 'editor'], default: 'editor' },
        sharedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Document = mongoose.model('Document', documentSchema);