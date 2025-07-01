import { Schema, model, Document } from 'mongoose';

export interface IImportLog extends Document {
  feedUrl: string;
  timestamp: Date;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  failures: string[];
}

const ImportLogSchema = new Schema<IImportLog>({
  feedUrl: String,
  timestamp: { type: Date, default: Date.now },
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: Number,
  failures: [String]
});

export default model<IImportLog>('ImportLog', ImportLogSchema); 