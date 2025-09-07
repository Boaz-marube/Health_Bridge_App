'use client'

import { useState, useEffect } from 'react'
import { staffService } from '@/app/services/staff.service'
import { notificationService } from '@/app/services/notification.service'
import { Bell, AlertTriangle, CheckCircle, Info, Send, Plus } from 'lucide-react'
import { formatName } from '@/app/lib/name-utils'
import { useToast } from '@/app/components/ui/toast'

interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  priority: 'low' | 'medium' | 'high'
  recipient: string
  sender: string
  read: boolean
  createdAt: string
}

export default function StaffNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newNotification, setNewNotification] = useState({
    recipientType: 'patient' as 'patient' | 'doctor',
    recipientId: '',
    title: '',
    message: '',
    type: 'system_alert' as const,
    priority: 'medium' as const
  })
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (showCreateForm) {
      fetchUsers()
    }
  }, [showCreateForm])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const [patientsData, doctorsData] = await Promise.all([
        staffService.getPatients(),
        staffService.getDoctors()
      ])
      setPatients(patientsData)
      setDoctors(doctorsData)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        const data = await notificationService.getNotifications(user.id, 'staff')
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!newNotification.recipientId || !newNotification.title || !newNotification.message) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    try {
      await notificationService.sendNotification({
        recipientId: newNotification.recipientId,
        recipientType: newNotification.recipientType,
        type: newNotification.type,
        title: newNotification.title,
        message: newNotification.message,
        priority: newNotification.priority
      })
      
      // Reset form
      setNewNotification({
        recipientType: 'patient',
        recipientId: '',
        title: '',
        message: '',
        type: 'system_alert',
        priority: 'medium'
      })
      setShowCreateForm(false)
      showToast('Notification sent successfully!', 'success')
    } catch (error) {
      console.error('Error sending notification:', error)
      showToast('Failed to send notification. Please try again.', 'error')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

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
          <p className="text-gray-600 dark:text-gray-400">Manage system notifications and alerts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Send Notification</span>
        </button>
      </div>

      {/* Create Notification Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Send New Notification</h2>
          <div className="space-y-4">
            {/* Recipient Selection - Moved to Top */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Type *
                </label>
                <select
                  value={newNotification.recipientType}
                  onChange={(e) => setNewNotification({...newNotification, recipientType: e.target.value as any, recipientId: ''})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select {newNotification.recipientType === 'patient' ? 'Patient' : 'Doctor'} *
                </label>
                <select
                  value={newNotification.recipientId}
                  onChange={(e) => setNewNotification({...newNotification, recipientId: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={loadingUsers}
                >
                  <option value="">Choose {newNotification.recipientType}...</option>
                  {newNotification.recipientType === 'patient' 
                    ? patients.map((patient) => (
                        <option key={patient._id} value={patient._id}>
                          {formatName(patient.name)} - {patient.email}
                        </option>
                      ))
                    : doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {formatName(doctor.name)} - {doctor.specialization}
                        </option>
                      ))
                  }
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter notification title"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message *
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
                placeholder="Enter your notification message"
              />
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value as any})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="system_alert">System Alert</option>
                  <option value="appointment_reminder">Appointment Reminder</option>
                  <option value="medicine_reminder">Medicine Reminder</option>
                  <option value="wellness_tip">Wellness Tip</option>
                  <option value="queue_update">Queue Update</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={newNotification.priority}
                  onChange={(e) => setNewNotification({...newNotification, priority: e.target.value as any})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={sendNotification}
                disabled={!newNotification.recipientId || !newNotification.title || !newNotification.message}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Notifications</h2>
        </div>
        <div className="p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`border rounded-lg p-4 ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'border-l-4' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {notification.priority.toUpperCase()}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>From: {formatName(notification.sender)}</span>
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {ToastComponent}
    </div>
  )
}