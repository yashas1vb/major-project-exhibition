import { Request, Response } from 'express';
import File from '../models/File';
import Workspace from '../models/Workspace';

export const getFiles = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const files = await File.find({ workspaceId });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getFileById = async (req: Request, res: Response) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.json(file);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const createFile = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const { name, language, content } = req.body;
        const username = (req as any).user?.username || 'Unknown';

        const file = await File.create({
            workspaceId,
            name,
            language,
            content: content || '',
        });


        // Log activity
        await Workspace.findByIdAndUpdate(workspaceId, {
            $push: {
                activityLog: {
                    user: (req as any).user?.username || 'System', // Fallback to System if unknown
                    action: 'Created File',
                    file: name,
                    timestamp: new Date()
                }
            }
        });

        res.status(201).json(file);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const updateFile = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        // Optimization: Do NOT log every file update to activity log. 
        // This causes excessive database writes and "Unknown updated file" spam.
        // If needed, we can log only major versions or have a separate commit system.

        const file = await File.findByIdAndUpdate(
            req.params.id,
            { content },
            { new: true }
        );

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Removed excessive activity logging

        res.json(file);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
