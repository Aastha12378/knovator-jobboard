import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createRedisConnection } from './redis';

let io: SocketIOServer | null = null;

// Initialize Socket.IO server with CORS configuration
export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Handle client connection lifecycle
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      console.info(`[socket] Client disconnected: ${socket.id}`);
    });
  });

  // Set up Redis pub/sub for real-time updates
  subscribeToRedisUpdates();

  return io;
}

// Get the global Socket.IO server instance
export function getSocketInstance(): SocketIOServer | null {
  return io;
}

// Set up Redis subscription for real-time import updates
async function subscribeToRedisUpdates() {
  const redis = createRedisConnection();
  
  await redis.subscribe('import:completed', 'import:failed', 'import:update');
  
  redis.on('message', (channel, message) => {
    try {
      const data = JSON.parse(message);
      
      if (io) {
        io.emit(channel, data);
      }
    } catch (error) {
      console.error('[socket] Error parsing Redis message:', error);
    }
  });
}

// Broadcast import completion to all connected clients
export function emitImportCompleted(logData: any) {
  if (io) {
    io.emit('import:completed', logData);
    io.emit('import:update', logData);
    io.emit('stats:update');
  }
}

// Broadcast import failure to all connected clients
export function emitImportFailed(feedUrl: string, error: string) {
  if (io) {
    io.emit('import:failed', { feedUrl, error });
    io.emit('stats:update');
  }
} 