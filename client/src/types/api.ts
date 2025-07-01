export interface ImportLog {
  _id: string
  feedUrl: string
  timestamp: string
  totalFetched: number
  totalImported: number
  newJobs: number
  updatedJobs: number
  failedJobs: number
  failures: string[]
}

export interface Job {
  _id: string
  externalId: string
  feedUrl: string
  title: string
  description: string
  company: string
  location: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
}

export interface Stats {
  totalJobs: number;
  totalImports: number;
  totalFetched: number;
  totalNewJobs: number;
  totalFailedJobs: number;
  successRate: string;
  failureRate: string;
  latestImport: {
    timestamp: string;
    fetched: number;
    imported: number;
    failed: number;
  } | null;
} 