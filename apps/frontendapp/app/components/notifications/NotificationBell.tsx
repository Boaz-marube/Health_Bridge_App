'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Eye, Clock } from 'lucide-react'
import { notificationService, Notification } from '@/app/services/notification.service'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NotificationPanel } from './NotificationPanel'

interface NotificationBellProps {
  userType: 'patient' | 'doctor' | 'staff'
  userId: string
}

export function NotificationBell({ userType, userId }: NotificationBellProps) {
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUnreadNotifications()
    const interval = setInterval(fetchUnreadNotifications, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [userId, userType])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUnreadNotifications = async () => {
    try {
      const data = await notificationService.getUnreadNotifications(userId, userType)
      setUnreadNotifications(data)
    } catch (error) {
      console.error('Error fetching unread notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setUnreadNotifications(prev => prev.filter(n => n._id !== notificationId))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder': return '📅'
      case 'medicine_reminder': return '💊'
      case 'queue_update': return '⏰'
      case 'wellness_tip': return '💡'
      case 'system_alert': return '⚠️'
      default: return '📢'
    }
  }

  const unreadCount = unreadNotifications.length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowPanel(true)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        userId={userId}
        userType={userType}
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
      />
    </div>
  )
}