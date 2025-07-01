import { Router } from 'express';
import ImportLog from '../models/ImportLog';

export const importLogsRouter = Router();

// GET /api/import-logs?page=1&limit=20
importLogsRouter.get('/', async (req, res, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ImportLog.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
      ImportLog.countDocuments()
    ]);

    res.json({ data: logs, page, limit, total });
  } catch (err) {
    next(err);
  }
}); 