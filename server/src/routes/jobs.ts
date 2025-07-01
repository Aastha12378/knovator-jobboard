import { Router } from 'express';
import Job from '../models/Job';
import ImportLog from '../models/ImportLog';

export const jobsRouter = Router();

// GET /api/jobs/stats
jobsRouter.get('/stats', async (req, res, next) => {
  try {
    const [totalJobs, importLogs, latestImportLog] = await Promise.all([
      Job.countDocuments(),
      ImportLog.find(),
      ImportLog.findOne().sort({ timestamp: -1 })
    ]);
    
    // Calculate aggregate stats from import logs
    const totalImports = importLogs.length;
    const totalFetched = importLogs.reduce((sum, log) => sum + (log.totalFetched || 0), 0);
    const totalNewJobs = importLogs.reduce((sum, log) => sum + (log.newJobs || 0), 0);
    const totalFailedJobs = importLogs.reduce((sum, log) => sum + (log.failedJobs || 0), 0);
    
    // Calculate success rate
    const successRate = totalFetched > 0 
      ? ((totalFetched - totalFailedJobs) / totalFetched * 100).toFixed(1)
      : "0.0";

    // Calculate failure rate
    const failureRate = totalFetched > 0
      ? ((totalFailedJobs / totalFetched) * 100).toFixed(1)
      : "0.0";

    res.json({
      totalJobs,
      totalImports,
      totalFetched,
      totalNewJobs,
      totalFailedJobs,
      successRate,
      failureRate,
      latestImport: latestImportLog ? {
        timestamp: latestImportLog.timestamp,
        fetched: latestImportLog.totalFetched,
        imported: latestImportLog.totalImported,
        failed: latestImportLog.failedJobs
      } : null
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs?feedUrl=...&page=1&limit=20
jobsRouter.get('/', async (req, res, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (req.query.feedUrl) {
      filter.feedUrl = req.query.feedUrl;
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter)
    ]);

    res.json({ data: jobs, page, limit, total });
  } catch (err) {
    next(err);
  }
}); 