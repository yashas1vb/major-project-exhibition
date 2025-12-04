import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspace extends Document {
    name: string;
    description?: string;
    ownerId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    activityLog: {
        user: string;
        action: string;
        file: string;
        timestamp: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const WorkspaceSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    activityLog: [{
        user: String,
        action: String,
        file: String,
        timestamp: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
