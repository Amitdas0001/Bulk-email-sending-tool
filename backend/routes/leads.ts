import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadCSV } from '../middleware/upload';
import { uploadCSV as uploadCSVController, getLeads, deleteLead, updateLead } from '../controllers/leadController';

const router = express.Router();


router.use(authenticateToken);


router.post('/upload-csv', uploadCSV.single('csvFile'), uploadCSVController);


router.get('/', getLeads);

router.put('/:leadId', updateLead);


router.delete('/:leadId', deleteLead);

export default router;