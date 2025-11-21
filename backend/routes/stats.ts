import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getSummaryStats } from '../controllers/statsController';

const router = express.Router();


router.use(authenticateToken);


router.get('/summary', getSummaryStats);

export default router;