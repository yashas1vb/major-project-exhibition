import express from 'express';
import { getFileById, updateFile } from '../controllers/fileController';

const router = express.Router();

router.get('/:id', getFileById);
router.put('/:id', updateFile);

export default router;
