
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = express.Router();


router.use(authenticateToken);

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;