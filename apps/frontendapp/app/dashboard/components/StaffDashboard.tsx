"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Users, Calendar, FileText, Settings, BarChart3, Shield, Bell, AlertTriangle, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react'
import { queueService, QueueStats } from '@/app/lib/queue-service'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

interface StaffDashboardProps {
  user: User
}

// Mock data for admin dashboard
const mockAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'High Queue Wait Time',
    message: 'Average wait time is 45 minutes - consider adding staff',
    time: '5 min ago',
    priority: 'high'
  },
  {
    id: 2,
    type: 'info',
    title: 'New Doctor Registration',
    message: 'Dr. Emily Johnson has completed registration',
    time: '1 hour ago',
    priority: 'normal'
  },
  {
    id: 3,
    type: 'success',
    title: 'System Backup Complete',
    message: 'Daily backup completed successfully',
    time: '3 hours ago',
    priority: 'low'
  }
]

const mockRecentActivity = [
  {
    id: 1,
    action: 'Patient Check-in',
    user: 'Sarah Johnson',
    time: '2 min ago',
    status: 'completed'
  },
  {
    id: 2,
    action: 'Appointment Scheduled',
    user: 'Dr. Michael Chen',
    time: '15 min ago',
    status: 'completed'
  },
  {
    id: 3,
    action: 'Medical Record Updated',
    user: 'Dr. Sarah Wilson',
    time: '32 min ago',
    status: 'completed'
  }
]

export default function StaffDashboard({ user }: StaffDashboardProps) {
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null)
  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 1234,
    todayAppointments: 89,
    recordsProcessed: 456,
    activeDoctors: 12,
    systemUptime: '99.9%',
    activePatients: 45
  })

  useEffect(() => {
    // Subscribe to queue updates for real-time stats
    const unsubscribe = queueService.subscribe((queue, stats) => {
      setQueueStats(stats)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {user.name}. Here's your system overview.</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="font-semibold text-gray-900 dark:text-white">{systemMetrics.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Appointments</p>
              <p className="font-semibold text-gray-900 dark:text-white">{systemMetrics.todayAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Patients</p>
              <p className="font-semibold text-gray-900 dark:text-white">{systemMetrics.activePatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Uptime</p>
              <p className="font-semibold text-gray-900 dark:text-white">{systemMetrics.systemUptime}</p>
            </div>
          </div>
        </div>
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
            
            {queueStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{queueStats.totalPatients}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total in Queue</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{queueStats.averageWaitTime}m</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Wait Time</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{queueStats.priorityPatients}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Priority Cases</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{queueStats.completedToday}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Loading queue data...</p>
              </div>
            )}
            
            <div className="mt-4 flex space-x-2">
              <Link href="/admin/queue" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
                Manage Queue
              </Link>
              <Link href="/admin/analytics" className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                View Analytics
              </Link>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Bell className="h-5 w-5" />
              <span>System Alerts</span>
            </h3>
            <div className="space-y-3">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' :
                  alert.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
                }`}>
                  <div className="flex items-start space-x-3">
                    {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />}
                    {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />}
                    {alert.type === 'info' && <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{alert.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{alert.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/admin/users" className="block w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-900 dark:text-white">Manage Users</span>
                </div>
              </Link>
              <Link href="/admin/appointments" className="block w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span className="text-gray-900 dark:text-white">View Appointments</span>
                </div>
              </Link>
              <Link href="/admin/reports" className="block w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <span className="text-gray-900 dark:text-white">Generate Reports</span>
                </div>
              </Link>
              <Link href="/admin/settings" className="block w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">System Settings</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/logs" className="block text-center mt-4 text-blue-500 hover:underline text-sm">
              View All Activity
            </Link>
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