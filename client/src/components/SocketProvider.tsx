'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null)

export function useSocket() {
  return useContext(SocketContext)
}

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Connected to server')
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.close()
    }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
} 