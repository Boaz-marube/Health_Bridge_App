import Link from 'next/link'
import { Calendar, FileText, Users, Activity } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

interface PatientDashboardProps {
  user: User
}

export default function PatientDashboard({ user }: PatientDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.name}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your health journey from your personalized dashboard.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/appointments" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Appointments</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Book & manage</p>
            </div>
          </div>
        </Link>

        <Link href="/health-records" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Health Records</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View history</p>
            </div>
          </div>
        </Link>

        <Link href="/doctors" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Find Doctors</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Search specialists</p>
            </div>
          </div>
        </Link>

        <Link href="/health-metrics" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Health Metrics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track vitals</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Appointments
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dr. Smith</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">General Checkup</p>
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400">Tomorrow 2:00 PM</span>
            </div>
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming appointments</p>
              <Link href="/appointments" className="text-blue-500 hover:underline text-sm">
                Book an appointment
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Health Records
          </h3>
          <div className="space-y-3">
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent records</p>
              <Link href="/health-records" className="text-blue-500 hover:underline text-sm">
                View all records
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}