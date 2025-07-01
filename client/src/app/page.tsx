'use client'

import { StatsCards } from '@/components/StatsCards'
import { ImportHistoryTable } from '@/components/ImportHistoryTable'
import { FeedManager } from '@/components/FeedManager'
import { Toaster } from '@/components/ui/toaster'
import { SocketProvider } from '@/components/SocketProvider'

export default function Home() {
  return (
    <SocketProvider>
      <>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 bg-background">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Job Importer Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track import history and monitor job feed processing
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[500px] flex flex-col">
                  <StatsCards />
                </div>
                <div className="h-[500px] flex flex-col">
                  <FeedManager />
                </div>
              </div>
              <ImportHistoryTable />
            </div>
          </div>
        </div>
        <Toaster />
      </>
    </SocketProvider>
  )
} 