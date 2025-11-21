import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import LeadList from '../models/LeadList';
import Lead from '../models/Lead';

export const createLeadList = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'List name is required' });
    }

    const leadList = await LeadList.create({
      userId: req.user._id,
      name,
      description,
    });

    res.status(201).json({ message: 'Lead list created successfully', leadList });
  } catch (error) {
    console.error('Create lead list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeadLists = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const leadLists = await LeadList.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ leadLists });
  } catch (error) {
    console.error('Get lead lists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeadListById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { listId } = req.params;
    const leadList = await LeadList.findOne({ _id: listId, userId: req.user._id });

    if (!leadList) {
      return res.status(404).json({ error: 'Lead list not found' });
    }

    const leads = await Lead.find({ leadListId: listId, userId: req.user._id });

    res.json({ leadList, leads });
  } catch (error) {
    console.error('Get lead list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLeadList = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { listId } = req.params;
    const { name, description } = req.body;

    const leadList = await LeadList.findOneAndUpdate(
      { _id: listId, userId: req.user._id },
      { name, description },
      { new: true, runValidators: true }
    );

    if (!leadList) {
      return res.status(404).json({ error: 'Lead list not found' });
    }

    res.json({ message: 'Lead list updated successfully', leadList });
  } catch (error) {
    console.error('Update lead list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteLeadList = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { listId } = req.params;

    // Delete all leads in this list
    await Lead.deleteMany({ leadListId: listId, userId: req.user._id });

    // Delete the list
    const leadList = await LeadList.findOneAndDelete({ _id: listId, userId: req.user._id });

    if (!leadList) {
      return res.status(404).json({ error: 'Lead list not found' });
    }

    res.json({ message: 'Lead list and all its leads deleted successfully' });
  } catch (error) {
    console.error('Delete lead list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bulkDeleteLeads = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { leadIds } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'Lead IDs array is required' });
    }

    const result = await Lead.deleteMany({
      _id: { $in: leadIds },
      userId: req.user._id,
    });

    // Update lead list counts
    const deletedLeads = await Lead.find({ _id: { $in: leadIds } });
    const listIds = [...new Set(deletedLeads.map(lead => lead.leadListId.toString()))];
    
    for (const listId of listIds) {
      const totalLeads = await Lead.countDocuments({ leadListId: listId });
      const activeLeads = await Lead.countDocuments({ leadListId: listId, status: 'active' });
      await LeadList.updateOne({ _id: listId }, { totalLeads, activeLeads });
    }

    res.json({ message: `${result.deletedCount} leads deleted successfully` });
  } catch (error) {
    console.error('Bulk delete leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
