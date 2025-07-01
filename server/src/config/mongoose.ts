import mongoose from 'mongoose';

export async function connectMongo(): Promise<typeof mongoose> {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/job-importer';
  mongoose.set('strictQuery', true);
  return mongoose.connect(mongoUri);
} 