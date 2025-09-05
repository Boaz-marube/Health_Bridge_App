import Link from 'next/link'
import { Users, Calendar, FileText, Settings, BarChart3, Shield } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

interface StaffDashboardProps {
  user: User
}

export default function StaffDashboard({ user }: StaffDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Staff Dashboard - {user.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage hospital operations and administrative tasks.
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,234</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">89</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Appointments</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">456</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Records Processed</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Doctors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/users" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Users className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            User Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage patients, doctors, and staff accounts
          </p>
        </Link>

        <Link href="/admin/appointments" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Calendar className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Appointment System
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Oversee scheduling and appointment management
          </p>
        </Link>

        <Link href="/admin/reports" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <BarChart3 className="h-12 w-12 text-purple-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Reports & Analytics
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            View system reports and usage analytics
          </p>
        </Link>

        <Link href="/admin/records" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <FileText className="h-12 w-12 text-orange-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Health Records
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and audit patient health records
          </p>
        </Link>

        <Link href="/admin/settings" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Settings className="h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            System Settings
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configure system preferences and policies
          </p>
        </Link>

        <Link href="/admin/security" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Shield className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Security & Audit
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor security logs and access controls
          </p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent System Activity
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="font-medium text-gray-900 dark:text-white">New Doctor Registration</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dr. Emily Johnson joined</p>
              <span className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="font-medium text-gray-900 dark:text-white">System Backup Completed</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily backup successful</p>
              <span className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</span>
            </div>
            <div className="text-center py-2">
              <Link href="/admin/logs" className="text-blue-500 hover:underline text-sm">
                View all activity
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Server Status</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Backup Status</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                Up to date
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}