import express from 'express';
import { executeCode } from '../controllers/executionController';

const router = express.Router();

router.post('/', executeCode);

export default router;
