import { Response, Request } from 'express';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer'; 
import { AuthRequest } from '../middleware/auth';
import EmailService from '../utils/emailService'; 
import Campaign, { ICampaign } from '../models/Campaign';
import Lead from '../models/Lead';
import User from '../models/User';
import EmailTracking from '../models/EmailTracking';

export const sendCampaign = [
  
  body('campaignId').notEmpty().isMongoId(),

  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const user = await User.findById(req.user._id);
      if (!user || !user.smtp || !user.smtp.host) {
          return res.status(400).json({ error: 'SMTP settings are not configured.' });
      }

      
      const campaign = await Campaign.findOne({
        _id: req.body.campaignId,
        userId: req.user._id
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      if (campaign.status === 'sending' || campaign.status === 'sent') {
        return res.status(400).json({ error: 'Campaign is already sending or has been sent.' });
      }

      // Get leads - either from specific list or all active leads
      const { leadListIds } = req.body;
      let leads;
      
      if (leadListIds && Array.isArray(leadListIds) && leadListIds.length > 0) {
        leads = await Lead.find({ 
          userId: req.user._id, 
          leadListId: { $in: leadListIds },
          status: 'active' 
        });
      } else {
        leads = await Lead.find({ userId: req.user._id, status: 'active' });
      }

      if (leads.length === 0) {
        return res.status(400).json({ error: 'No active leads to send to.' });
      }

      // Initialize tracking records for all leads
      const trackingPromises = leads.map(lead => 
        EmailTracking.findOneAndUpdate(
          { campaignToken: campaign.campaignToken, leadId: lead._id },
          { 
            campaignId: campaign._id,
            campaignToken: campaign.campaignToken,
            leadId: lead._id,
            email: lead.email,
            status: 'queued',
            createdAt: new Date()
          },
          { upsert: true, new: true }
        )
      );
      await Promise.all(trackingPromises);

      // Update campaign stats
      campaign.status = 'sending';
      campaign.totalRecipients = leads.length;
      await campaign.save();
      
      res.json({ 
        message: 'Campaign sending initiated.',
        totalRecipients: leads.length,
        campaignToken: campaign.campaignToken
      });
      
      // Send emails asynchronously
      EmailService.sendBulkEmails(campaign, leads, user).catch(error => {
        console.error('Bulk email error:', error);
      });

    } catch (error) {
      console.error('Send campaign error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },
];

export const getCampaignStatus = async (req: Request, res: Response) => {
  try {
    const { campaignToken } = req.params;
    const campaign = await Campaign.findOne({ campaignToken });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      status: {
        campaignToken: campaign.campaignToken,
        name: campaign.name,
        status: campaign.status,
      }
    });
  } catch (error) {
    console.error('Get campaign status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const testEmailConnection = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        
        const user = await User.findById(req.user._id);
        if (!user || !user.smtp || !user.smtp.host || !user.smtp.user || !user.smtp.pass) {
            return res.status(400).json({ error: 'SMTP settings are incomplete.' });
        }
        
        
        
        
        const transporter = nodemailer.createTransport({
          host: user.smtp.host,
          port: user.smtp.port || 587,
          secure: (user.smtp.port || 587) === 465,
          auth: {
            user: user.smtp.user,
            pass: user.smtp.pass,
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        await transporter.verify();
        
        res.json({ success: true, message: 'Connection successful!' });

    } catch (error) {
        console.error('Test connection error:', error);
        res.status(400).json({ success: false, error: 'Connection failed.', details: (error as Error).message });
    }
};