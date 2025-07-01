import { Schema, model, Document } from 'mongoose';

export interface IFeed extends Document {
  url: string;
  createdAt: Date;
}

const FeedSchema = new Schema<IFeed>({
  url: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IFeed>('Feed', FeedSchema); 