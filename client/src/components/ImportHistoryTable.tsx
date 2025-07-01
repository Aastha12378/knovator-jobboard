'use client'

import { useEffect, useState } from 'react'
import { useSocket } from './SocketProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { fetchImportLogs, type ImportLog } from '@/lib/api'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function ImportHistoryTable() {
  const [logs, setLogs] = useState<ImportLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const itemsPerPage = 20
  const socket = useSocket()

  const totalPages = Math.ceil(total / itemsPerPage)

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true)
        const response = await fetchImportLogs(currentPage, itemsPerPage)
        setLogs(response.data)
        setTotal(response.total)
      } catch (error) {
        console.error('Failed to load import logs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [currentPage])

  useEffect(() => {
    if (!socket) return

    function handleImportUpdate(data: ImportLog) {
      setLogs(prev => [data, ...prev.slice(0, itemsPerPage - 1)])
      setTotal(prev => prev + 1)
    }

    socket.on('import:update', handleImportUpdate)
    socket.on('import:completed', handleImportUpdate)

    return () => {
      socket.off('import:update', handleImportUpdate)
      socket.off('import:completed', handleImportUpdate)
    }
  }, [socket])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ', ' + new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const formattedUrl = urlObj.hostname + urlObj.pathname
      if (formattedUrl.length > 30) {
        return formattedUrl.substring(0, 27) + '...'
      }
      return formattedUrl
    } catch {
      if (url.length > 30) {
        return url.substring(0, 27) + '...'
      }
      return url
    }
  }

  const getStatusBadge = (log: ImportLog) => {
    if (log.failedJobs > 0 && log.totalImported === 0) {
      return <Badge variant="destructive" className="text-red-600">Failed</Badge>
    }
    if (log.failedJobs > 0) {
      return <Badge variant="secondary" className="text-orange-600">Partial</Badge>
    }
    return <Badge className="text-green-600">Success</Badge>
  }

  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      )
      if (startPage > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import History</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: {total} import operations
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feed URL</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>New</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Failed</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No import logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="font-medium">
                    <div 
                      className="max-w-[200px] truncate hover:cursor-help" 
                      title={log.feedUrl}
                      data-tooltip-id="url-tooltip"
                    >
                      {formatUrl(log.feedUrl)}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell>{log.totalImported}</TableCell>
                  <TableCell>{log.newJobs}</TableCell>
                  <TableCell>{log.updatedJobs}</TableCell>
                  <TableCell>{log.failedJobs}</TableCell>
                  <TableCell>{getStatusBadge(log)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 