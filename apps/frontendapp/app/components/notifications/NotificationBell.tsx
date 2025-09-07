'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Eye, Clock } from 'lucide-react'
import { notificationService, Notification } from '@/app/services/notification.service'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NotificationBellProps {
  userType: 'patient' | 'doctor' | 'staff'
  userId: string
}

export function NotificationBell({ userType, userId }: NotificationBellProps) {
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
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
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <Link
                href={`/${userType}/notifications`}
                className="text-blue-500 hover:text-blue-600 text-sm"
                onClick={() => setShowDropdown(false)}
              >
                View All
              </Link>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No new notifications
              </div>
            ) : (
              unreadNotifications.slice(0, 5).map((notification) => (
                <div
                  key={notification._id}
                  className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    handleMarkAsRead(notification._id)
                    setShowDropdown(false)
                    router.push(`/${userType}/notifications`)
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {notification.title}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notification._id)
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {unreadNotifications.length > 5 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link
                href={`/${userType}/notifications`}
                className="text-blue-500 hover:text-blue-600 text-sm"
                onClick={() => setShowDropdown(false)}
              >
                View {unreadNotifications.length - 5} more notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}