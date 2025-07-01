import feeds from '../config/feeds.json';
import Feed from '../models/Feed';

export async function seedFeeds(): Promise<void> {
  await Promise.all(
    feeds.map(url =>
      Feed.updateOne({ url }, { url }, { upsert: true })
    )
  );
  console.info(`[seedFeeds] Ensured ${feeds.length} feeds in database`);
} 