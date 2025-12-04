import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db';
import workspaceRoutes from './routes/workspaceRoutes';
import fileRoutes from './routes/fileRoutes';
import executionRoutes from './routes/executionRoutes';

dotenv.config();


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
        methods: ['GET', 'POST'],
        credentials: true
    }
});
app.use(cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    credentials: true
}));
app.use(express.json());

import './config/passport'; // Import passport config
import authRoutes from './routes/authRoutes';
import passport from 'passport';

// ...

app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/execute', executionRoutes);

const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

import { setupSocketHandlers } from './services/socketService';

// ...

const startServer = async () => {
    await connectDB();

    setupSocketHandlers(io);

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
