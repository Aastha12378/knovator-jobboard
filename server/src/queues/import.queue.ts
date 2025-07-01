import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis';

const connection = createRedisConnection();

export const queue = new Queue('import-feed', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
}); 