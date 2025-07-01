'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fetchFeeds, addFeed, deleteFeed, type Feed } from '@/lib/api'
import { Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// List of allowed job feed domains
const ALLOWED_JOB_FEED_DOMAINS = [
  'weworkremotely.com',
  'himalayas.app',
  'jobicy.com',
  'remoteok.com',
  'stackoverflow.com',
  'linkedin.com',
  'indeed.com',
  'glassdoor.com',
  'dice.com',
  'monster.com'
]

export function FeedManager() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadFeeds()
  }, [])

  const isValidJobFeedUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      // Check if the URL is from an allowed domain
      return ALLOWED_JOB_FEED_DOMAINS.some(domain => urlObj.hostname.includes(domain)) &&
        // Check if it's an RSS feed URL
        (url.toLowerCase().includes('rss') || url.toLowerCase().includes('feed'))
    } catch (error) {
      return false
    }
  }

  async function loadFeeds() {
    try {
      setLoading(true)
      const response = await fetchFeeds()
      setFeeds(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load feeds",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddFeed(e: React.FormEvent) {
    e.preventDefault()
    const trimmedUrl = newFeedUrl.trim()
    
    if (!trimmedUrl) {
      toast({
        title: "Error",
        description: "Please enter a feed URL",
        variant: "destructive",
      })
      return
    }

    if (!isValidJobFeedUrl(trimmedUrl)) {
      toast({
        title: "Invalid Feed URL",
        description: "Please enter a valid job RSS feed URL from a supported job platform",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAdding(true)
      await addFeed(trimmedUrl)
      toast({
        title: "Success",
        description: "Feed added successfully",
      })
      setNewFeedUrl('')
      loadFeeds()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add feed",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  async function handleDeleteFeed(url: string) {
    try {
      await deleteFeed(url)
      toast({
        title: "Success",
        description: "Feed deleted successfully",
      })
      loadFeeds()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete feed",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Feed Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Feed Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddFeed} className="mb-4 flex gap-4">
          <input
            type="url"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            placeholder="Enter job feed URL"
            className="flex-1 px-3 py-2 border rounded-md bg-background text-foreground"
            required
          />
          <Button type="submit" disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" />
            Add Feed
          </Button>
        </form>

        <div className="relative rounded-md border">
          <div className="overflow-auto max-h-[320px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[50%]">Feed URL</TableHead>
                  <TableHead className="w-[35%]">Added On</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-32">
                      No feeds configured
                    </TableCell>
                  </TableRow>
                ) : (
                  feeds.map((feed) => (
                    <TableRow key={feed._id}>
                      <TableCell className="font-medium">
                        <div className="truncate hover:cursor-help" title={feed.url}>
                          {feed.url}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(feed.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFeed(feed.url)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 