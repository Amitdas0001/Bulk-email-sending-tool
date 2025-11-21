import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; 
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import Campaign from '../models/Campaign';
import Lead from '../models/Lead';

export const createCampaign = [
  
  body('name').notEmpty().trim().isLength({ max: 255 }),
  body('subject').notEmpty().trim().isLength({ max: 255 }),
  body('htmlContent').notEmpty(),
  body('textContent').optional(),

  async (req: AuthRequest, res: Response) => {
    try {
      
      

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { name, subject, htmlContent, textContent } = req.body;
      const campaignToken = uuidv4(); 
      
      const attachments = req.files ? (req.files as Express.Multer.File[]).map(file => ({
        filename: file.originalname,
        path: file.path, 
        contentType: file.mimetype,
      })) : [];
      
      const totalRecipients = await Lead.countDocuments({ 
        userId: req.user._id,
        status: 'active'
      });
      
      const campaign = new Campaign({
        userId: req.user._id,
        campaignToken,
        name,
        subject,
        htmlContent,
        textContent,
        attachments,
        totalRecipients,
      });

      await campaign.save();

      res.status(201).json({
        message: 'Campaign created successfully',
        campaign: {
          id: campaign._id,
          campaignToken: campaign.campaignToken,
          name: campaign.name,
          subject: campaign.subject,
          status: campaign.status,
          totalRecipients: campaign.totalRecipients,
          createdAt: campaign.createdAt,
        },
      });

    } catch (error) {
      console.error('Create campaign error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
];

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const campaigns = await Campaign.find({ userId: req.user._id })
      .select('-htmlContent -textContent -attachments')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Campaign.countDocuments({ userId: req.user._id });

    res.json({
      campaigns,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCampaigns: total,
        hasNext: skip + campaigns.length < total,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCampaignByToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;
    let campaign;
    
    if (req.user) {
      campaign = await Campaign.findOne({ 
        campaignToken: token, 
        userId: req.user._id 
      });
    } else {
      campaign = await Campaign.findOne({ campaignToken: token })
        .select('name subject status totalRecipients sentCount openCount clickCount spamCount createdAt sentAt');
    }

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ campaign });
  } catch (error) {
    console.error('Get campaign by token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCampaign = [
  
  body('name').optional().notEmpty().trim().isLength({ max: 255 }),
  body('subject').optional().notEmpty().trim().isLength({ max: 255 }),
  body('htmlContent').optional().notEmpty(),
  body('textContent').optional(),

  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { campaignId } = req.params;
      const updateData = req.body;
      
      const campaign = await Campaign.findOne({ 
        _id: campaignId, 
        userId: req.user._id 
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (campaign.status === 'sending' || campaign.status === 'sent') {
        return res.status(400).json({ error: 'Cannot update campaign that is being sent or already sent' });
      }
      
      const updatedCampaign = await Campaign.findByIdAndUpdate(
        campaignId,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        message: 'Campaign updated successfully',
        campaign: updatedCampaign,
      });

    } catch (error) {
      console.error('Update campaign error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
];

export const deleteCampaign = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { campaignId } = req.params;

    const campaign = await Campaign.findOneAndDelete({ 
      _id: campaignId, 
      userId: req.user._id 
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    if (campaign.status === 'sending') {
      return res.status(400).json({ error: 'Cannot delete campaign that is currently being sent' });
    }

    res.json({ message: 'Campaign deleted successfully' });

  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};