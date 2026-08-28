import express from 'express';
import { getLogbookReport, exportLogbookPDF, exportLogbookExcel } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/logbook', getLogbookReport);
router.get('/logbook/pdf', exportLogbookPDF);
router.get('/logbook/excel', exportLogbookExcel);

export default router;
