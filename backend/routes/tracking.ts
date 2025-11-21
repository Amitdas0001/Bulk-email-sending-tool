import express from 'express';
import { 
  trackEmailOpen, 
  trackLinkClick, 
  getTrackingAnalytics,
  handleUnsubscribe 
} from '../controllers/trackingController';

const router = express.Router();

// All tracking routes are public (no auth required)

// Email open tracking (returns 1x1 pixel)
router.get('/open/:campaignToken', trackEmailOpen);

// Link click tracking (redirects to original URL)
router.get('/click/:campaignToken', trackLinkClick);

// Get tracking analytics
router.get('/analytics/:campaignToken', getTrackingAnalytics);

// Unsubscribe handling
router.get('/unsubscribe/:campaignToken', handleUnsubscribe);
router.post('/unsubscribe/:campaignToken', handleUnsubscribe);

export default router;