const API_BASE = process.env.NEXT_PUBLIC_API_URL

import type { Stats } from '@/types/api'

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

export interface Feed {
  url: string
  _id: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
}

export async function fetchImportLogs(page = 1, limit = 50): Promise<ApiResponse<ImportLog>> {
  const response = await fetch(`${API_BASE}/import-logs?page=${page}&limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch import logs')
  }
  return response.json()
}

export async function fetchStats(): Promise<Stats> {
  const response = await fetch(`${API_BASE}/jobs/stats`)
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }
  return response.json()
}

export async function fetchFeeds(): Promise<{ data: Feed[]; total: number }> {
  const response = await fetch(`${API_BASE}/feeds`)
  if (!response.ok) {
    throw new Error('Failed to fetch feeds')
  }
  return response.json()
}

export async function addFeed(url: string): Promise<{ message: string; url: string; isNew: boolean }> {
  const response = await fetch(`${API_BASE}/feeds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to add feed')
  }
  return response.json()
}

export async function deleteFeed(url: string): Promise<{ message: string; removed: boolean }> {
  const response = await fetch(`${API_BASE}/feeds`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete feed')
  }
  return response.json()
} 