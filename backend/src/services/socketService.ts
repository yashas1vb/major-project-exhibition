import { Server, Socket } from 'socket.io';
import Room from '../models/Room';

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        // Join a room (workspace file or whiteboard)
        socket.on('join-room', async (roomId: string, user: any) => {
            try {
                // Check if room exists, if not create it (for now, to allow easy testing)
                // In a stricter version, we might require explicit creation via API first
                let room = await Room.findOne({ roomId });

                if (!room) {
                    socket.emit('room-not-found', roomId);
                    return;
                }

                socket.join(roomId);
                console.log(`User ${socket.id} joined room ${roomId}`);

                // Add participant
                const participant = {
                    userId: user?.id || socket.id,
                    username: user?.username || user?.name || 'Anonymous',
                    socketId: socket.id
                };

                // Check if already in participants to avoid duplicates (e.g. reconnect)
                const existingIdx = room.participants.findIndex(p => p.userId === participant.userId);
                if (existingIdx > -1) {
                    room.participants[existingIdx] = participant;
                } else {
                    room.participants.push(participant);
                }
                await room.save();

                // Notify others
                socket.to(roomId).emit('user-joined', { user: participant });

                // Send current state to joiner
                socket.emit('room-state', {
                    data: room.data,
                    participants: room.participants
                });

            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', 'Could not join room');
            }
        });

        socket.on('create-room', async (roomId: string, type: 'code' | 'whiteboard') => {
            try {
                const existing = await Room.findOne({ roomId });
                if (existing) {
                    socket.emit('room-exists', roomId);
                    return;
                }
                await Room.create({
                    roomId,
                    type,
                    participants: [],
                    data: type === 'code' ? '// Start coding...' : []
                });
                socket.emit('room-created', roomId);
            } catch (error) {
                console.error('Error creating room:', error);
            }
        });

        // Leave a room
        socket.on('leave-room', async (roomId: string) => {
            try {
                socket.leave(roomId);
                console.log(`User ${socket.id} left room ${roomId}`);

                const room = await Room.findOne({ roomId });
                if (room) {
                    room.participants = room.participants.filter(p => p.socketId !== socket.id);
                    await room.save();
                    socket.to(roomId).emit('user-left', { userId: socket.id });
                }
            } catch (error) {
                console.error('Error leaving room:', error);
            }
        });

        // Code changes
        socket.on('code-change', async ({ roomId, content }: { roomId: string; content: string }) => {
            // Broadcast immediately for responsiveness
            socket.to(roomId).emit('code-change', content);

            // Persist to DB (TODO: Debounce this in production)
            try {
                await Room.updateOne({ roomId }, { data: content });
            } catch (error) {
                console.error('Error saving code:', error);
            }
        });

        // Cursor movement
        socket.on('cursor-move', ({ roomId, cursor, user }: { roomId: string; cursor: any, user: any }) => {
            socket.to(roomId).emit('cursor-move', {
                userId: user?.id || socket.id,
                username: user?.username || 'Anonymous',
                cursor
            });
        });

        // Whiteboard drawing
        socket.on('draw-line', async ({ roomId, data }: { roomId: string; data: any }) => {
            socket.to(roomId).emit('draw-line', data);

            // Persist (append to data array? or just replace? Whiteboard data structure depends on implementation)
            // Assuming data is a drawing operation, we might want to append it to a history.
            // For now, let's assume 'data' in Room model for whiteboard is an array of operations.
            try {
                // This is a simplification. Real whiteboard sync is complex.
                // We'll just push the operation to the list.
                await Room.updateOne({ roomId }, { $push: { data: data } });
            } catch (error) {
                console.error('Error saving drawing:', error);
            }
        });

        socket.on('clear-canvas', async ({ roomId }: { roomId: string }) => {
            socket.to(roomId).emit('clear-canvas');
            try {
                await Room.updateOne({ roomId }, { data: [] });
            } catch (error) {
                console.error('Error clearing canvas:', error);
            }
        });

        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);
            // Find all rooms this socket was in and remove them
            try {
                const rooms = await Room.find({ 'participants.socketId': socket.id });
                for (const room of rooms) {
                    room.participants = room.participants.filter(p => p.socketId !== socket.id);
                    await room.save();
                    socket.to(room.roomId).emit('user-left', { userId: socket.id });
                }
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });
    });
};
