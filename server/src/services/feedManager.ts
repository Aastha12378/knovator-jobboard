import { writeFileSync } from 'fs';
import { join } from 'path';
import Feed from '../models/Feed';
import feedsJson from '../config/feeds.json';

// Add new feed to both DB and JSON file
export async function addFeed(url: string): Promise<{ isNew: boolean }> {
  const result = await Feed.updateOne({ url }, { url }, { upsert: true });
  
  // Update JSON file for persistence
  if (result.upsertedCount) {
    const updatedFeeds = [...new Set([...feedsJson, url])];
    const feedsPath = join(__dirname, '../config/feeds.json');
    writeFileSync(feedsPath, JSON.stringify(updatedFeeds, null, 2));
  }
  
  return { isNew: !!result.upsertedCount };
}

// Remove feed from both DB and JSON file  
export async function removeFeed(url: string): Promise<{ removed: boolean }> {
  const result = await Feed.deleteOne({ url });
  
  // Update JSON file
  if (result.deletedCount) {
    const updatedFeeds = feedsJson.filter(f => f !== url);
    const feedsPath = join(__dirname, '../config/feeds.json');
    writeFileSync(feedsPath, JSON.stringify(updatedFeeds, null, 2));
  }
  
  return { removed: !!result.deletedCount };
}

// Get all feeds from database
export async function getAllFeeds() {
  return await Feed.find().sort({ createdAt: -1 });
} 