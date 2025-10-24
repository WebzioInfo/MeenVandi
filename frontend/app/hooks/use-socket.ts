'use client'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [locations, setLocations] = useState<any[]>([])

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('meenvandi_token'),
      },
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to server')
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    socketInstance.on('locationUpdate', (data) => {
      setLocations(prev => [...prev, data])
    })

    socketInstance.on('orderStatusUpdate', (data) => {
      // Handle order status updates
      console.log('Order status updated:', data)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return {
    socket,
    isConnected,
    locations,
  }
}