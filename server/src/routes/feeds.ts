import { Router } from 'express';
import { addFeed, removeFeed, getAllFeeds } from '../services/feedManager';

export const feedsRouter = Router();

// GET /api/feeds - List all feeds from database
feedsRouter.get('/', async (req, res, next) => {
  try {
    const feeds = await getAllFeeds();
    res.json({ data: feeds, total: feeds.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/feeds - Add new feed dynamically
feedsRouter.post('/', async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    const { isNew } = await addFeed(url);
    res.json({ message: 'Feed added successfully', url, isNew });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/feeds - Remove feed dynamically  
feedsRouter.delete('/', async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const { removed } = await removeFeed(url);
    res.json({ 
      message: removed ? 'Feed removed successfully' : 'Feed not found',
      removed 
    });
  } catch (err) {
    next(err);
  }
}); 