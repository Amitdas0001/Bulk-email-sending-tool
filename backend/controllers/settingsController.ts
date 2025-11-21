
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';



export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    
    res.json({ settings: req.user.smtp || {} });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { host, port, user, pass } = req.body;
    
    
    

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'smtp.host': host,
        'smtp.port': port,
        'smtp.user': user,
        'smtp.pass': pass, 
      }
    });

    res.json({ message: 'Settings updated successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};