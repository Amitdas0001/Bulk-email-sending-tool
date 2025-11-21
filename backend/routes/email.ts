import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { sendCampaign, getCampaignStatus, testEmailConnection } from '../controllers/emailController';

const router = express.Router();


router.get('/status/:campaignToken', getCampaignStatus);


router.use(authenticateToken);


router.post('/send', sendCampaign);
router.get('/test-connection', testEmailConnection);

export default router;