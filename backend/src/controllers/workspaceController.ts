import { Request, Response } from 'express';
import Workspace from '../models/Workspace';
import User from '../models/User';

export const getWorkspaces = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const workspaces = await Workspace.find({
            $or: [{ ownerId: userId }, { createdBy: userId }, { members: userId }]
        }).populate('ownerId', 'username email').populate('members', 'username email');

        res.json(workspaces);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getWorkspaceById = async (req: Request, res: Response) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .populate('ownerId', 'username email')
            .populate('members', 'username email');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }
        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const createWorkspace = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const workspace = await Workspace.create({
            name,
            description,
            ownerId: userId,
            createdBy: userId,
            members: [userId], // Owner is also a member
            activityLog: [{
                user: 'System',
                action: 'Created Workspace',
                file: 'N/A',
                timestamp: new Date()
            }]
        });

        res.status(201).json(workspace);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const inviteUser = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const workspaceId = req.params.id;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Check if already member
        if (workspace.members.includes(user._id as any)) {
            return res.status(400).json({ message: 'User already a member' });
        }

        workspace.members.push(user._id as any);
        workspace.activityLog.push({
            user: (req as any).user?.username || 'System',
            action: 'Invited User',
            file: user.username,
            timestamp: new Date()
        });

        await workspace.save();

        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const deleteWorkspace = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.id;
        const userId = (req as any).user?.id;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (workspace.ownerId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this workspace' });
        }

        await Workspace.findByIdAndDelete(workspaceId);

        res.json({ message: 'Workspace deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const joinWorkspace = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.body;
        const userId = (req as any).user?.id;
        const username = (req as any).user?.username || 'Unknown';

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Check if already member or owner
        if (workspace.ownerId.toString() === userId || workspace.members.includes(userId)) {
            return res.status(400).json({ message: 'You are already a member of this workspace' });
        }

        workspace.members.push(userId);
        workspace.activityLog.push({
            user: username,
            action: 'Joined Workspace',
            file: 'N/A',
            timestamp: new Date()
        });

        await workspace.save();

        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
