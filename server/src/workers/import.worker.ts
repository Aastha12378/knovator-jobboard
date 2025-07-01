import { Worker, Job } from 'bullmq';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import mongoose from 'mongoose';
import { createRedisConnection } from '../config/redis';
import { connectMongo } from '../config/mongoose';
import JobModel from '../models/Job';
import ImportLogModel from '../models/ImportLog';

type QueuePayload = { url: string };

// Initialize worker process to handle feed imports
(async () => {
  await connectMongo();

  // Set up worker with configurable concurrency
  const concurrency = parseInt(process.env.WORKER_CONCURRENCY ?? '5', 10);
  const connection = createRedisConnection();
  const publisher = createRedisConnection();

  // Create BullMQ worker to process feed imports
  const worker = new Worker<QueuePayload>('import-feed', async (bullJob: Job<QueuePayload>) => {
    const { url } = bullJob.data;
    return await processFeed(url, publisher);
  }, {
    connection,
    concurrency
  });

  // Handle successful job completion
  worker.on('completed', (job, result) => {
    const { feedUrl, totalImported } = result ?? {};
    console.info(`[worker] Completed import for ${feedUrl} – imported ${totalImported}`);
  });

  // Handle job failures and notify clients
  worker.on('failed', (job, err) => {
    console.error(`[worker] Job failed for ${job?.data?.url}:`, err);
    if (job?.data?.url) {
      publisher.publish('import:failed', JSON.stringify({
        feedUrl: job.data.url,
        error: err.message
      }));
    }
  });
})();

// Process individual feed and import jobs
async function processFeed(feedUrl: string, publisher?: any) {
  const log = {
    feedUrl,
    timestamp: new Date(),
    totalFetched: 0,
    totalImported: 0,
    newJobs: 0,
    updatedJobs: 0,
    failedJobs: 0,
    failures: [] as string[]
  };

  try {
    // Fetch and parse XML feed
    const resp = await axios.get<string>(feedUrl, { responseType: 'text', timeout: 15000 });
    const parsed = await parseStringPromise(resp.data, { explicitArray: false, mergeAttrs: true });

    // Handle different RSS feed structures
    const items = (parsed?.rss?.channel?.item || parsed?.channel?.item || parsed?.item) as any[];
    if (!items || !Array.isArray(items)) {
      console.warn(`[worker] No items found for feed ${feedUrl}`);
      return log;
    }

    log.totalFetched = items.length;

    // Transform feed items into job documents
    const bulkOps = items.map(item => {
      try {
        const externalId = item.guid?._ || item.guid || item.link || item.id || item.title;
        if (!externalId) {
          log.failedJobs++;
          log.failures.push('Missing externalId');
          return null;
        }

        const jobDoc = {
          externalId: String(externalId),
          feedUrl,
          title: item.title || '',
          description: item['content:encoded'] || item.description || '',
          company: item.author || item.company || '',
          location: item.location || item['job_location'] || '',
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
          raw: item
        };

        return {
          updateOne: {
            filter: { externalId: jobDoc.externalId },
            update: { $set: jobDoc },
            upsert: true
          }
        };
      } catch (err: any) {
        log.failedJobs++;
        log.failures.push(err.message);
        return null;
      }
    }).filter(op => op !== null);

    // Perform bulk upsert operation
    if (bulkOps.length > 0) {
      const bulkResult = await JobModel.bulkWrite(bulkOps);
      
      if (bulkResult.upsertedCount) {
        log.newJobs += bulkResult.upsertedCount;
      }
      if (bulkResult.modifiedCount) {
        log.updatedJobs += bulkResult.modifiedCount;
      }
    }

    log.totalImported = log.newJobs + log.updatedJobs;
  } catch (err: any) {
    log.failedJobs = log.totalFetched;
    log.failures.push(err.message);
  } finally {
    // Save import log and notify clients
    const savedLog = await ImportLogModel.create(log);

    if (publisher) {
      await publisher.publish('import:completed', JSON.stringify({
        ...log,
        _id: savedLog._id
      }));

      await publisher.publish('import:update', JSON.stringify({
        ...log,
        _id: savedLog._id
      }));
    }
  }

  return log;
} 