import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
    workspaceId: mongoose.Types.ObjectId;
    name: string;
    content: string;
    language: string;
    createdAt: Date;
    updatedAt: Date;
}

const FileSchema: Schema = new Schema({
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true },
    content: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
}, { timestamps: true });

// Ensure unique filenames within a workspace
FileSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

export default mongoose.model<IFile>('File', FileSchema);
