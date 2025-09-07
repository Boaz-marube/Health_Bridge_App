'use client'

import Link from 'next/link'
import { Calendar, Users, FileText, Clock } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {getTimeBasedGreeting()}, {getDoctorDisplayName()}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your practice and patient care from your dashboard.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats.todayAppointments || 0}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Appointments</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats.totalPatients || 0}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats.pendingReviews || 0}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats.queueLength || 0}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Queue Length</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/doctor/appointments" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Calendar className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Manage Schedule
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your appointment schedule
          </p>
        </Link>

        <Link href="/doctor/patients" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Users className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Patient Records
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Access and update patient information
          </p>
        </Link>

        <Link href="/doctor/queue" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Clock className="h-12 w-12 text-orange-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Patient Queue
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage patient queue and appointments
          </p>
        </Link>
      </div>

      {/* Patient Queue */}
      {loading ? (
        <QueueSkeleton />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Queue ({dashboardData?.stats.queueLength || 0} patients)
          </h3>
          <div className="space-y-2">
            {dashboardData?.currentQueue && dashboardData.currentQueue.length > 0 ? (
              dashboardData.currentQueue.slice(0, 5).map((queueItem, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
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
                  <span className={`px-2 py-1 rounded text-xs ${
                    queueItem.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    queueItem.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {queueItem.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No patients in queue
              </div>
            )}
            {dashboardData?.currentQueue && dashboardData.currentQueue.length > 5 && (
              <div className="text-center py-2">
                <Link href="/doctor/queue" className="text-blue-500 hover:underline text-sm">
                  View full queue ({dashboardData.currentQueue.length - 5} more)
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Schedule
          </h3>
          <div className="space-y-3">
            {dashboardData?.todaySchedule && dashboardData.todaySchedule.length > 0 ? (
              dashboardData.todaySchedule.slice(0, 3).map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {appointment.patientId?.name || 'Unknown Patient'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {appointment.appointmentType || 'Consultation'}
                    </p>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {appointment.appointmentTime}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No appointments scheduled for today
              </div>
            )}
            <div className="text-center py-2">
              <Link href="/doctor/appointments" className="text-blue-500 hover:underline text-sm">
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
            {dashboardData?.recentUpdates && dashboardData.recentUpdates.length > 0 ? (
              dashboardData.recentUpdates.slice(0, 3).map((update, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="font-medium text-gray-900 dark:text-white">
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
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No recent updates
              </div>
            )}
            <div className="text-center py-2">
              <Link href="/doctor/patients" className="text-blue-500 hover:underline text-sm">
                View all updates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}