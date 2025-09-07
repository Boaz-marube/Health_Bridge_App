'use client'

import { useState, useEffect } from 'react'
import { notificationService, Notification } from '@/app/services/notification.service'
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Eye, EyeOff, Calendar, Pill, Heart, Trash2 } from 'lucide-react'
import { formatName } from '@/app/lib/name-utils'
import { useToast } from '@/app/components/ui/toast'
import { ConfirmModal } from '@/app/components/ui/ConfirmModal'

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { showToast, ToastComponent } = useToast()
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; notificationId: string | null }>({ isOpen: false, notificationId: null })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        const data = await notificationService.getNotifications(user.id, 'patient')
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        await notificationService.markAllAsRead(user.id, 'patient')
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        showToast('All notifications marked as read', 'success')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      showToast('Failed to mark notifications as read', 'error')
    }
  }

  const handleDeleteNotification = async () => {
    if (!deleteModal.notificationId) return
    
    try {
      await notificationService.deleteNotification(deleteModal.notificationId)
      setNotifications(prev => prev.filter(n => n._id !== deleteModal.notificationId))
      if (selectedNotification?._id === deleteModal.notificationId) {
        setSelectedNotification(null)
      }
      showToast('Notification deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting notification:', error)
      showToast('Failed to delete notification', 'error')
    } finally {
      setDeleteModal({ isOpen: false, notificationId: null })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder': return <Calendar className="h-5 w-5 text-blue-500" />
      case 'medicine_reminder': return <Pill className="h-5 w-5 text-green-500" />
      case 'queue_update': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'wellness_tip': return <Heart className="h-5 w-5 text-pink-500" />
      case 'system_alert': return <AlertTriangle className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead
      case 'read': return notification.isRead
      case 'all':
      default: return true
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading notifications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">Stay updated with your health information</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button
            onClick={handleMarkAllAsRead}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Your Notifications ({filteredNotifications.length})
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => {
                      setSelectedNotification(notification)
                      if (!notification.isRead) {
                        handleMarkAsRead(notification._id)
                      }
                    }}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedNotification?._id === notification._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getNotificationIcon(notification.type)}
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteModal({ isOpen: true, notificationId: notification._id })
                          }}
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Delete notification"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notification Detail */}
        <div className="lg:col-span-2">
          {selectedNotification ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getNotificationIcon(selectedNotification.type)}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedNotification.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(selectedNotification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, notificationId: selectedNotification._id })}
                      className="text-red-500 hover:text-red-700 px-3 py-1 border border-red-300 rounded text-sm flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                    <span className={`px-3 py-1 rounded text-sm ${getPriorityColor(selectedNotification.priority)}`}>
                      {selectedNotification.priority} priority
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      {selectedNotification.isRead ? (
                        <><Eye className="h-4 w-4" /> Read</>
                      ) : (
                        <><EyeOff className="h-4 w-4" /> Unread</>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedNotification.message}
                  </p>
                </div>

                {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Additional Information</h3>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select a Notification
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a notification from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>
      {ToastComponent}
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteNotification}
        onCancel={() => setDeleteModal({ isOpen: false, notificationId: null })}
      />
    </div>
  )
}