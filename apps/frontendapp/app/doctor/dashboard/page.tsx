'use client'

import Link from 'next/link'
import { Calendar, Users, FileText, Clock, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { doctorService, DashboardData } from '@/app/services/doctor.service'
import { useWebSocket } from '@/app/hooks/useWebSocket'
import StatCardSkeleton from '@/app/components/skeletons/StatCardSkeleton'
import QueueSkeleton from '@/app/components/skeletons/QueueSkeleton'
import { getTimeBasedGreeting } from '@/app/lib/time-utils'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

export default function DoctorDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchDashboardData(parsedUser.id)
    }
  }, [])

  const fetchDashboardData = async (userId: string) => {
    const data = await doctorService.getDashboard(userId)
    setDashboardData(data)
    
    // Also fetch doctor profile for name display
    const profile = await doctorService.getProfile(userId)
    setDoctorProfile(profile)
    
    setLoading(false)
  }

  // WebSocket for real-time queue updates
  useWebSocket({
    userId: user?.id || '',
    onQueueUpdate: () => {
      if (user?.id) {
        fetchDashboardData(user.id)
      }
    }
  })

  const getDoctorDisplayName = () => {
    if (doctorProfile) {
      const name = doctorProfile.name
      // If name already starts with Dr., return as is
      if (name.startsWith('Dr.')) {
        return name
      }
      // Otherwise, extract first name and add Dr. prefix
      const firstName = name.split(/[0-9@._-]/)[0]
      const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
      return `Dr. ${capitalizedName}`
    }
    return `Dr. ${user?.name}`
  }


  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Welcome Section */}
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {getTimeBasedGreeting()}, {getDoctorDisplayName()}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Manage your practice and patient care from your dashboard.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Appointments</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {dashboardData?.stats.todayAppointments || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {dashboardData?.stats.totalPatients || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {dashboardData?.stats.pendingReviews || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Queue Length</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {dashboardData?.stats.queueLength || 0}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link href="/doctor/appointments" className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow">
          <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Manage Schedule
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage your appointment schedule
          </p>
        </Link>

        <Link href="/doctor/patients" className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow">
          <Users className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Patient Records
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Access and update patient information
          </p>
        </Link>

        <Link href="/doctor/queue" className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow">
          <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-orange-500 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Patient Queue
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage patient queue and appointments
          </p>
        </Link>

        <Link href="/doctor/lab-results" className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow">
          <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-purple-500 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Upload Lab Results
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload and manage patient lab results
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Patient Queue */}
          {loading ? (
            <QueueSkeleton />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-3 md:mb-0">
                  <Clock className="h-5 w-5" />
                  <span>Current Queue ({dashboardData?.stats.queueLength || 0} patients)</span>
                </h3>
                <Link 
                  href="/doctor/queue"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <span className="hidden sm:inline">Manage Queue</span>
                  <span className="sm:hidden">Manage</span>
                </Link>
              </div>
              <div className="space-y-3">
                {dashboardData?.currentQueue && dashboardData.currentQueue.length > 0 ? (
                  dashboardData.currentQueue.slice(0, 5).map((queueItem, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                          {queueItem.position}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {queueItem.patientId?.name || 'Unknown Patient'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {queueItem.priority === 'emergency' ? '🚨 Emergency' : 
                             queueItem.priority === 'priority' ? '⚡ Priority' : '📋 Normal'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        queueItem.status === 'waiting' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        queueItem.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {queueItem.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">No patients in queue</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5" />
              <span>Today's Schedule</span>
            </h3>
            <div className="space-y-3">
              {dashboardData?.todaySchedule && dashboardData.todaySchedule.length > 0 ? (
                dashboardData.todaySchedule.slice(0, 3).map((appointment, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 sm:space-y-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appointment.patientId?.name || 'Unknown Patient'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.appointmentType || 'Consultation'}
                      </p>
                    </div>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {appointment.appointmentTime}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today</p>
                  <Link 
                    href="/doctor/appointments"
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm inline-block"
                  >
                    View Schedule
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Patient Updates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5" />
              <span>Recent Updates</span>
            </h3>
            <div className="space-y-3">
              {dashboardData?.recentUpdates && dashboardData.recentUpdates.length > 0 ? (
                dashboardData.recentUpdates.slice(0, 3).map((update, index) => (
                  <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {update.status === 'completed' ? 'Appointment Completed' : 'Appointment Updated'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Patient: {update.patientId?.name || 'Unknown'}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(update.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No recent updates</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}