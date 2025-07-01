import cron from 'node-cron';
import Feed from './models/Feed';
import { queue } from './queues/import.queue';

export function startScheduler(): void {
  cron.schedule('0 * * * *', async () => {
  // cron.schedule('*/2 * * * *', async () => {
    const feeds = await Feed.find();
    feeds.forEach(f => queue.add('import-feed', { url: f.url }));
    console.info(`[scheduler] Enqueued ${feeds.length} import jobs`);
  });
} 