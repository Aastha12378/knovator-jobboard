'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchStats } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import type { Stats } from '@/types/api'

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    totalImports: 0,
    totalFetched: 0,
    totalNewJobs: 0,
    totalFailedJobs: 0,
    successRate: "0.0",
    failureRate: "0.0",
    latestImport: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="flex-1">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Badge variant="outline">All Time</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Jobs in database
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Badge variant="outline">Percentage</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Of total fetched jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
              <Badge variant="outline">Percentage</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failureRate}%</div>
              <p className="text-xs text-muted-foreground">
                Of total fetched jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
              <Badge variant="outline">Operations</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalImports.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Import operations completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Jobs</CardTitle>
              <Badge variant="outline">All Time</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalNewJobs?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Newly added jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
              <Badge variant="outline">All Time</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.totalFailedJobs?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Failed to import
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
} 