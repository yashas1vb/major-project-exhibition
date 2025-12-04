import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
    roomId: string;
    type: 'code' | 'whiteboard';
    participants: {
        userId: string;
        username: string;
        socketId: string;
    }[];
    data: any; // Store code content or whiteboard elements
    createdAt: Date;
    updatedAt: Date;
}

const RoomSchema: Schema = new Schema({
    roomId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['code', 'whiteboard'], required: true },
    participants: [{
        userId: { type: String },
        username: { type: String },
        socketId: { type: String }
    }],
    data: { type: Schema.Types.Mixed, default: '' }, // Default empty string for code, or empty array for whiteboard
}, { timestamps: true });

export default mongoose.model<IRoom>('Room', RoomSchema);
