import Link from 'next/link'
import { Calendar, Users, FileText, Clock } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

interface DoctorDashboardProps {
  user: User
}

export default function DoctorDashboard({ user }: DoctorDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Good morning, Dr. {user.name}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your practice and patient care from your dashboard.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">8</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Appointments</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">156</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">3</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">24</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Records Updated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/appointments" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Calendar className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Manage Schedule
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your appointment schedule
          </p>
        </Link>

        <Link href="/patients" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Users className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Patient Records
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Access and update patient information
          </p>
        </Link>

        <Link href="/consultations" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <FileText className="h-12 w-12 text-purple-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Consultations
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Review consultation notes and prescriptions
          </p>
        </Link>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Schedule
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Annual Checkup</p>
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400">9:00 AM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Jane Smith</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Follow-up</p>
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400">10:30 AM</span>
            </div>
            <div className="text-center py-2">
              <Link href="/appointments" className="text-blue-500 hover:underline text-sm">
                View full schedule
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Patient Updates
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="font-medium text-gray-900 dark:text-white">Lab Results Available</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Patient: Sarah Johnson</p>
              <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
            </div>
            <div className="text-center py-2">
              <Link href="/patients" className="text-blue-500 hover:underline text-sm">
                View all updates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}