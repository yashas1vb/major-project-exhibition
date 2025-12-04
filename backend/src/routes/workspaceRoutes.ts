import express from 'express';
import { getWorkspaces, getWorkspaceById, createWorkspace, inviteUser, deleteWorkspace, joinWorkspace } from '../controllers/workspaceController';
import { getFiles, createFile } from '../controllers/fileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.post('/join', joinWorkspace);
router.get('/:id', getWorkspaceById);
router.delete('/:id', deleteWorkspace);
router.post('/:id/invite', inviteUser);

// Nested file routes
router.get('/:workspaceId/files', getFiles);
router.post('/:workspaceId/files', createFile);

export default router;
