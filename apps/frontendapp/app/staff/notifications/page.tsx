'use client'

import { useState, useEffect } from 'react'
import { staffService } from '@/app/services/staff.service'
import { notificationService } from '@/app/services/notification.service'
import { Bell, AlertTriangle, CheckCircle, Info, Send, Plus, Inbox, SendIcon, Trash2, Edit, RotateCcw } from 'lucide-react'
import { formatName } from '@/app/lib/name-utils'
import { useToast } from '@/app/components/ui/toast'
import { ConfirmModal } from '@/app/components/ui/ConfirmModal'

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
  const [sentNotifications, setSentNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [loading, setLoading] = useState(true)
  const [loadingSent, setLoadingSent] = useState(false)
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
  const [editingNotification, setEditingNotification] = useState<any>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    fetchNotifications()
    fetchSentNotifications()
  }, [])

  useEffect(() => {
    if (activeTab === 'sent') {
      fetchSentNotifications()
    }
  }, [activeTab])

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
      console.log('Fetched patients:', patientsData.length)
      console.log('Fetched doctors:', doctorsData.length)
      console.log('Doctors data:', doctorsData.map(d => ({name: d.name, specialization: d.specialization})))
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

  const fetchSentNotifications = async () => {
    setLoadingSent(true)
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        const data = await notificationService.getSentNotifications(user.id)
        
        // Get patients and doctors to resolve names
        const [patientsData, doctorsData] = await Promise.all([
          staffService.getPatients(),
          staffService.getDoctors()
        ])
        
        // Add recipient names to notifications
        const notificationsWithNames = data.map(notification => {
          let recipientName = notification.recipientId
          
          if (notification.recipientType === 'patient') {
            const patient = patientsData.find(p => p._id === notification.recipientId)
            recipientName = patient ? formatName(patient.name) : notification.recipientId
          } else if (notification.recipientType === 'doctor') {
            const doctor = doctorsData.find(d => d._id === notification.recipientId)
            recipientName = doctor ? formatName(doctor.name) : notification.recipientId
          }
          
          return {
            ...notification,
            recipientName
          }
        })
        
        setSentNotifications(notificationsWithNames)
      }
    } catch (error) {
      console.error('Error fetching sent notifications:', error)
    } finally {
      setLoadingSent(false)
    }
  }

  const sendNotification = async () => {
    if (!newNotification.recipientId || !newNotification.title || !newNotification.message) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    setSendLoading(true)
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
      // Always refresh sent notifications after sending
      fetchSentNotifications()
    } catch (error) {
      console.error('Error sending notification:', error)
      showToast('Failed to send notification. Please try again.', 'error')
    } finally {
      setSendLoading(false)
    }
  }

  const handleDeleteClick = (notificationId: string) => {
    setNotificationToDelete(notificationId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!notificationToDelete) return
    
    setDeleteLoading(true)
    try {
      await notificationService.deleteNotification(notificationToDelete)
      showToast('Notification deleted successfully!', 'success')
      fetchSentNotifications()
    } catch (error) {
      showToast('Failed to delete notification', 'error')
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
      setNotificationToDelete(null)
    }
  }

  const editNotification = (notification: any) => {
    setEditingNotification({
      ...notification,
      recipientType: notification.recipientType,
      recipientId: notification.recipientId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority
    })
    setShowEditForm(true)
  }

  const updateNotification = async () => {
    if (!editingNotification.title || !editingNotification.message) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    try {
      // Delete old notification and create new one (resend)
      await notificationService.deleteNotification(editingNotification._id)
      await notificationService.sendNotification({
        recipientId: editingNotification.recipientId,
        recipientType: editingNotification.recipientType,
        type: editingNotification.type,
        title: editingNotification.title,
        message: editingNotification.message,
        priority: editingNotification.priority
      })
      
      setEditingNotification(null)
      setShowEditForm(false)
      showToast('Notification updated and resent successfully!', 'success')
      fetchSentNotifications()
    } catch (error) {
      showToast('Failed to update notification', 'error')
    }
  }

  const resendNotification = async (notification: any) => {
    try {
      await notificationService.sendNotification({
        recipientId: notification.recipientId,
        recipientType: notification.recipientType,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority
      })
      
      showToast('Notification resent successfully!', 'success')
      fetchSentNotifications()
    } catch (error) {
      showToast('Failed to resend notification', 'error')
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



  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage system notifications and alerts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded flex items-center justify-center space-x-2 text-sm sm:text-base transition-colors"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Send Notification</span>
          <span className="sm:hidden">Send</span>
        </button>
      </div>

      {/* Create Notification Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Send New Notification</h2>
          <div className="space-y-4">
            {/* Recipient Selection - Moved to Top */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Type *
                </label>
                <select
                  value={newNotification.recipientType}
                  onChange={(e) => setNewNotification({...newNotification, recipientType: e.target.value as any, recipientId: ''})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
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
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
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
                          {doctor.name ? formatName(doctor.name) : `Dr. ${doctor.specialization || 'Unknown'}`} - {doctor.specialization || 'General'}
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
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
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
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                rows={4}
                placeholder="Enter your notification message"
              />
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value as any})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
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
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={sendNotification}
                disabled={!newNotification.recipientId || !newNotification.title || !newNotification.message || sendLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center justify-center space-x-2 text-sm sm:text-base transition-colors"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{sendLoading ? 'Sending...' : 'Send'}</span>
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Form */}
      {showEditForm && editingNotification && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit & Resend Notification</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={editingNotification.title}
                onChange={(e) => setEditingNotification({...editingNotification, title: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message *
              </label>
              <textarea
                value={editingNotification.message}
                onChange={(e) => setEditingNotification({...editingNotification, message: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={editingNotification.type}
                  onChange={(e) => setEditingNotification({...editingNotification, type: e.target.value})}
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
                  value={editingNotification.priority}
                  onChange={(e) => setEditingNotification({...editingNotification, priority: e.target.value})}
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
                onClick={updateNotification}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Update & Resend</span>
              </button>
              <button
                onClick={() => {setShowEditForm(false); setEditingNotification(null)}}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 sm:space-x-8 px-3 sm:px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Inbox className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Received ({notifications.length})</span>
                <span className="sm:hidden">Inbox ({notifications.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <SendIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Sent ({sentNotifications.length})</span>
              </div>
            </button>
          </nav>
        </div>
        <div className="p-3 sm:p-6">
          {activeTab === 'received' ? (
            loading ? (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600 dark:text-gray-400">Loading notifications...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Inbox className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No received notifications</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border rounded-lg p-3 sm:p-4 ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'border-l-4' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate pr-2">
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2 flex-shrink-0">
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
                        <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm sm:text-base">
                          {notification.message}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <span className="truncate">From: {formatName(notification.sender)}</span>
                          <span className="text-xs">{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            loadingSent ? (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600 dark:text-gray-400">Loading sent notifications...</div>
              </div>
            ) : sentNotifications.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <SendIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No sent notifications</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {sentNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border rounded-lg p-3 sm:p-4 ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate pr-2">
                            {notification.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              notification.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {notification.priority.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              notification.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              notification.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              notification.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {notification.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm sm:text-base">
                          {notification.message}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <span className="truncate">To: {notification.recipientName || notification.recipientId}</span>
                          <span className="text-xs">{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-2 sm:space-y-0">
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Sent by: {notification.senderName || 'Staff Member'}
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => resendNotification(notification)}
                              className="text-blue-500 hover:text-blue-700 p-1.5 sm:p-1 rounded transition-colors"
                              title="Resend"
                            >
                              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => editNotification(notification)}
                              className="text-green-500 hover:text-green-700 p-1.5 sm:p-1 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(notification._id)}
                              className="text-red-500 hover:text-red-700 p-1.5 sm:p-1 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
      />
      
      {ToastComponent}
    </div>
  )
}