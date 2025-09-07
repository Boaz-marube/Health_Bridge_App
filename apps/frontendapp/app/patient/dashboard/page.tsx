'use client'

import { useState, useEffect } from 'react'
import { patientService, PatientDashboardData } from '@/app/services/patient.service'
import { formatPatientName } from '@/app/lib/name-utils'
import { Calendar, Clock, Users, Pill, Heart, Bell, Activity, MapPin, Plus, FileText } from 'lucide-react'
import { useWebSocket } from '@/app/hooks/useWebSocket'
import { queueService, QueueStatus } from '@/app/services/queue.service'
import StatCardSkeleton from '@/app/components/skeletons/StatCardSkeleton'
import AppointmentSkeleton from '@/app/components/skeletons/AppointmentSkeleton'
import { getTimeBasedGreeting } from '@/app/lib/time-utils'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

export default function PatientDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<string[]>([])
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({ position: null, estimatedWaitTime: 0, status: 'not_in_queue' })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchDashboardData(parsedUser.id)
    }
  }, [])

  // WebSocket for real-time updates
  useWebSocket({
    userId: user?.id || '',
    onAppointmentUpdate: (data) => {
      // Update appointments when status changes
      setAppointments(prev => prev.map(apt => 
        apt._id === data.appointmentId 
          ? { ...apt, status: data.status }
          : apt
      ))
      // Show notification
      setNotifications(prev => [...prev, data.message])
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.slice(1))
      }, 5000)
    },
    onQueueUpdate: (data) => {
      // Update queue status
      setQueueStatus(prev => ({ ...prev, ...data }))
      if (data.message) {
        setNotifications(prev => [...prev, data.message])
        setTimeout(() => {
          setNotifications(prev => prev.slice(1))
        }, 5000)
      }
    },
    onNotification: (data) => {
      setNotifications(prev => [...prev, data.message])
      setTimeout(() => {
        setNotifications(prev => prev.slice(1))
      }, 5000)
    }
  })

  const fetchDashboardData = async (userId: string) => {
    const [dashboardData, appointmentsData, queueData] = await Promise.all([
      patientService.getDashboard(userId),
      patientService.getAppointments(userId),
      queueService.getPatientQueueStatus()
    ])
    
    // Filter for confirmed appointments only
    const confirmedAppointments = appointmentsData.filter(
      (apt: any) => apt.status === 'confirmed' || apt.status === 'scheduled'
    )
    
    setDashboardData(dashboardData)
    setAppointments(confirmedAppointments)
    setQueueStatus(queueData)
    setLoading(false)
  }



  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div key={index} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
              {notification}
            </div>
          ))}
        </div>
      )}

      {/* Welcome Section */}
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {getTimeBasedGreeting()}, {dashboardData?.patient ? formatPatientName(dashboardData.patient.name) : formatPatientName(user?.name || '')}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Here's your health overview for today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next Appointment</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {appointments[0] 
                      ? new Date(appointments[0].appointmentDate).toLocaleDateString()
                      : 'None scheduled'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Queue Position</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {queueStatus.position ? `#${queueStatus.position}` : 'Not in queue'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Est. Wait Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {queueStatus.estimatedWaitTime || 0} min
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Medications</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{dashboardData?.stats.prescriptions || 0} Active</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          {loading ? (
            <AppointmentSkeleton />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Appointments</span>
                </h3>
                <button 
                  onClick={() => window.location.href = '/patient/appointments'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Book New</span>
                </button>
              </div>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">No confirmed appointments</p>
                    <button 
                      onClick={() => window.location.href = '/patient/appointments'}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Book Appointment
                    </button>
                  </div>
                ) : (
                  appointments.slice(0, 3).map((appointment: any) => (
                    <div key={appointment._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {appointment.doctorId?.name || 'Doctor'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {appointment.appointmentType || 'Consultation'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          appointment.status === 'confirmed' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Medicine Reminders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Pill className="h-5 w-5" />
              <span>Today's Medications</span>
            </h3>
            <div className="space-y-3">
              {dashboardData?.stats.prescriptions === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No active medications</p>
                </div>
              ) : (
                Array.from({ length: Math.min(dashboardData?.stats.prescriptions || 0, 3) }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Medication {index + 1}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{index === 0 ? '8:00 AM' : index === 1 ? '2:00 PM' : '8:00 PM'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      index === 0 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}>
                      {index === 0 ? "Taken" : "Pending"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Wellness Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Heart className="h-5 w-5" />
              <span>Today's Wellness Tip</span>
            </h3>
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">Stay Hydrated</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {dashboardData?.wellnessTips[0] || 'Aim for 8 glasses of water today. Proper hydration helps your body function optimally.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}