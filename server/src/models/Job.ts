import { Schema, model, Document } from 'mongoose';

export interface IJob extends Document {
  externalId: string;
  feedUrl: string;
  title: string;
  description: string;
  company: string;
  location: string;
  publishedAt: Date;
  raw: unknown;
}

const JobSchema = new Schema<IJob>({
  externalId: { type: String, unique: true, index: true },
  feedUrl: String,
  title: String,
  description: String,
  company: String,
  location: String,
  publishedAt: Date,
  raw: Schema.Types.Mixed
});

export default model<IJob>('Job', JobSchema); 