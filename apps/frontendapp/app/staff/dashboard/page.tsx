'use client'

import { useState, useEffect } from 'react'
import { staffService, StaffDashboardData } from '@/app/services/staff.service'
import { Users, Calendar, FileText, Settings, BarChart3, Shield, Bell, AlertTriangle, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react'
import { formatName } from '@/app/lib/name-utils'
import StatCardSkeleton from '@/app/components/skeletons/StatCardSkeleton'
import { getTimeBasedGreeting } from '@/app/lib/time-utils'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

export default function StaffDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [dashboardData, setDashboardData] = useState<StaffDashboardData | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchDashboardData(parsedUser.id)
    }
  }, [])

  const fetchDashboardData = async (staffId: string) => {
    try {
      const [dashboardData, notificationsData] = await Promise.all([
        staffService.getDashboard(staffId),
        staffService.getNotifications(staffId)
      ])
      setDashboardData(dashboardData)
      setNotifications(notificationsData.slice(0, 3))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">{getTimeBasedGreeting()}, {formatName(user?.name || '')}. Here's your system overview.</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Queue Length</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{dashboardData?.stats.queueLength || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Appointments</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{dashboardData?.stats.totalAppointments || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{dashboardData?.stats.completedAppointments || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{dashboardData?.stats.cancelledAppointments || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Queue Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5" />
              <span>Queue Management</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dashboardData?.queueStatus.totalPatients || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total in Queue</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{dashboardData?.queueStatus.inProgressPatients || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{dashboardData?.queueStatus.waitingPatients || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Priority Cases</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboardData?.queueStatus.completedToday || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => window.location.href = '/staff/queue'}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Manage Queue
              </button>
              <button 
                onClick={() => window.location.href = '/staff/analytics'}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                View Analytics
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Bell className="h-5 w-5" />
              <span>System Alerts</span>
            </h3>
            <div className="space-y-3">
              {notifications.length > 0 ? notifications.map((notification, index) => (
                <div key={index} className="p-3 rounded-lg border-l-4 bg-blue-50 dark:bg-blue-900/20 border-blue-400">
                  <div className="flex items-start space-x-3">
                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{notification.title || 'System Notification'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message || notification.content}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/staff/appointments'}
                className="block w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span className="text-gray-900 dark:text-white">Manage Appointments</span>
                </div>
              </button>
              <button 
                onClick={() => window.location.href = '/staff/queue'}
                className="block w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-900 dark:text-white">Queue Management</span>
                </div>
              </button>
              <button 
                onClick={() => window.location.href = '/staff/analytics'}
                className="block w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <span className="text-gray-900 dark:text-white">Generate Reports</span>
                </div>
              </button>
              <button 
                onClick={() => window.location.href = '/staff/notifications'}
                className="block w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">Notifications</span>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {dashboardData?.scheduledAppointments && dashboardData.scheduledAppointments.length > 0 ? (
                dashboardData.scheduledAppointments.slice(0, 3).map((appointment, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Appointment Scheduled</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{formatName(appointment.patientName || '')} • {new Date(appointment.appointmentDate).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Server Status</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Database</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Queue System</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Backup Status</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                  Up to date
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}