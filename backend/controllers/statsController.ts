import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Campaign from '../models/Campaign';
import Lead from '../models/Lead';
import EmailTracking from '../models/EmailTracking';

export const getSummaryStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    
    const totalLeads = await Lead.countDocuments({ userId });
    const totalCampaigns = await Campaign.countDocuments({ userId });

    
    const userCampaigns = await Campaign.find({ userId }).select('_id');
    const campaignIds = userCampaigns.map(c => c._id);

    
    const realSentCount = await EmailTracking.countDocuments({
      campaignId: { $in: campaignIds },
      status: 'sent'
    });
    
    
    
    const realOpenCount = await EmailTracking.countDocuments({
      campaignId: { $in: campaignIds },
      openedAt: { $exists: true } 
    });
    
    
    const openRate = realSentCount > 0 ? (realOpenCount / realSentCount) * 100 : 0;

    
    res.status(200).json({
      totalLeads: totalLeads,
      totalCampaigns: totalCampaigns,
      emailsSent: realSentCount,
      openRate: openRate,
    });

  } catch (error) {
    console.error('Error fetching summary stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};