import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketHookProps {
  userId: string
  onAppointmentUpdate?: (data: any) => void
  onQueueUpdate?: (data: any) => void
  onNotification?: (data: any) => void
}

export const useWebSocket = ({ 
  userId, 
  onAppointmentUpdate, 
  onQueueUpdate, 
  onNotification 
}: WebSocketHookProps) => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return

    // Connect to WebSocket server
    socketRef.current = io('http://localhost:5002', {
      transports: ['websocket'],
    })

    const socket = socketRef.current

    // Join user-specific room
    socket.emit('join', userId)

    // Listen for appointment updates
    if (onAppointmentUpdate) {
      socket.on('appointmentUpdated', onAppointmentUpdate)
    }

    // Listen for queue updates
    if (onQueueUpdate) {
      socket.on('queueUpdated', onQueueUpdate)
    }

    // Listen for notifications
    if (onNotification) {
      socket.on('notification', onNotification)
    }

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [userId, onAppointmentUpdate, onQueueUpdate, onNotification])

  return socketRef.current
}