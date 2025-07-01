import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { connectMongo } from './config/mongoose';
import { seedFeeds } from './services/seedFeeds';
import { startScheduler } from './scheduler';
import { initializeSocket } from './config/socket';
import dotenv from 'dotenv';

dotenv.config();

// Main server bootstrap function
async function bootstrap(): Promise<void> {
  // Connect to MongoDB
  await connectMongo();
  console.info('[mongo] Connected');

  // Seed feeds collection from JSON file
  await seedFeeds();

  // Start cron scheduler for hourly imports
  startScheduler();

  // Initialize Express app
  const app = express();
  const port = process.env.PORT || 3001;

  // Built-in middleware
  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  }));
  app.use(express.json());

  // API routers
  const { importLogsRouter } = await import('./routes/importLogs');
  const { jobsRouter } = await import('./routes/jobs');
  const { feedsRouter } = await import('./routes/feeds');

  app.use('/api/import-logs', importLogsRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/feeds', feedsRouter);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Global error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[error]', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Create HTTP server for Socket.IO
  const httpServer = createServer(app);
  
  // Initialize Socket.IO
  const io = initializeSocket(httpServer);
  console.info('[socket] Socket.IO initialized');

  httpServer.listen(port, () => {
    console.info(`[server] Listening on port ${port}`);
    console.info(`[socket] Real-time updates enabled`);
  });
}

bootstrap().catch(err => {
  console.error('[bootstrap] Failed to start server', err);
  process.exit(1);
}); 