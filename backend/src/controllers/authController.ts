import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-it';

const generateToken = (user: IUser) => {
    return jwt.sign(
        { id: user._id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        // Passport attaches user to req.user
        const user = req.user as IUser;
        const token = generateToken(user);

        console.log('Google Auth Success:', { userId: user._id, email: user.email });

        // Redirect to frontend with token
        // Assuming frontend is on localhost:8080 or similar. 
        // We should make this configurable.
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        console.log('Redirecting to:', `${frontendUrl}/auth/success`);
        res.redirect(`${frontendUrl}/auth/success?token=${token}`);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect('/login?error=auth_failed');
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        // Middleware should attach user to req
        const user = req.user as IUser; // Type assertion if middleware adds it
        // Actually, if we use a custom middleware, we might attach it to req.user or similar.
        // Let's assume req.user is populated by middleware.

        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const dbUser = await User.findById(user._id || (user as any).id);
        if (!dbUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: dbUser._id,
            username: dbUser.username,
            email: dbUser.email,
            avatarUrl: dbUser.avatarUrl,
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
