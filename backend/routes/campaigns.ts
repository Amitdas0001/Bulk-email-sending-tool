import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadAttachment } from '../middleware/upload';
import { 
  createCampaign, 
  getCampaigns, 
  getCampaignByToken, 
  updateCampaign, 
  deleteCampaign 
} from '../controllers/campaignController';

const router = express.Router();

router.get('/public/:token', getCampaignByToken);

router.use(authenticateToken);


router.post('/', uploadAttachment.array('attachments', 5), createCampaign);
router.get('/', getCampaigns);
router.get('/:token', getCampaignByToken);
router.put('/:campaignId', uploadAttachment.array('attachments', 5), updateCampaign);
router.delete('/:campaignId', deleteCampaign);

export default router;