import express from 'express';
import { getDocuments, createDocument } from '../controllers/documentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getDocuments);
router.post('/', createDocument);

export default router;
