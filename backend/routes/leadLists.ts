import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createLeadList,
  getLeadLists,
  getLeadListById,
  updateLeadList,
  deleteLeadList,
  bulkDeleteLeads,
} from '../controllers/leadListController';

const router = express.Router();

router.use(authenticateToken);

// Lead list routes
router.post('/', createLeadList);
router.get('/', getLeadLists);
router.get('/:listId', getLeadListById);
router.put('/:listId', updateLeadList);
router.delete('/:listId', deleteLeadList);

// Bulk operations
router.post('/bulk-delete', bulkDeleteLeads);

export default router;
