"use client"

import Link from 'next/link'
import { Calendar, Clock, Users, FileText, Pill, Heart, Plus, QrCode, Activity, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { patientService, PatientDashboardData } from '@/app/services/patient.service'
import { formatPatientName } from '@/app/lib/name-utils'

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
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const data = await patientService.getDashboard(user.id)
      setDashboardData(data)
      setLoading(false)
    }

    fetchDashboardData()
  }, [user.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {dashboardData?.patient ? formatPatientName(dashboardData.patient.name) : formatPatientName(user.name)}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Here's your health overview for today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Next Appointment</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {dashboardData?.upcomingAppointments[0] 
                  ? new Date(dashboardData.upcomingAppointments[0].appointmentDate).toLocaleDateString()
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
                {dashboardData?.queuePosition.position ? `#${dashboardData.queuePosition.position}` : 'Not in queue'}
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
                {dashboardData?.queuePosition.estimatedWaitTime || 0} min
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Queue Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5" />
              <span>Current Queue Status</span>
            </h3>
            
            {dashboardData?.queuePosition.position ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Position</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">#{dashboardData.queuePosition.position}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Wait</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{dashboardData.queuePosition.estimatedWaitTime} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      dashboardData.queuePosition.status === 'waiting' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : dashboardData.queuePosition.status === 'called'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {dashboardData.queuePosition.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {dashboardData.queuePosition.position <= 3 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded">
                    <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                      🔔 You'll be called soon! Please stay nearby.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No active queue position</p>
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
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
              {dashboardData?.upcomingAppointments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
                  <button 
                    onClick={() => window.location.href = '/patient/appointments'}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Book Appointment
                  </button>
                </div>
              ) : (
                dashboardData?.upcomingAppointments.slice(0, 3).map((appointment: any) => (
                  <div key={appointment._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-white">{appointment.doctorName || 'Doctor'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.appointmentType || 'Consultation'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {new Date(appointment.appointmentTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        appointment.status === "scheduled" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}>
                        {appointment.status}
                      </span>
                      <div>
                        <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5" />
              <span>Recent Medical History</span>
            </h3>
            <div className="space-y-4">
              {dashboardData?.recentNotifications.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No recent medical history</p>
                </div>
              ) : (
                dashboardData?.recentNotifications.slice(0, 3).map((record: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">{record.title || 'Medical Record'}</p>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(record.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{record.doctorName || 'Doctor'}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{record.message || record.description || 'Medical update'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => window.location.href = '/patient/medical-history'}
              className="w-full mt-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              View Full History
            </button>
          </div>
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
            <button 
              onClick={() => window.location.href = '/patient/medications'}
              className="w-full mt-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Manage Medications</span>
            </button>
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
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                      {dashboardData?.wellnessTips[0] ? dashboardData.wellnessTips[0].split(' - ')[0] || 'Stay Hydrated' : 'Stay Hydrated'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {dashboardData?.wellnessTips[0] || 'Aim for 8 glasses of water today. Proper hydration helps your body function optimally.'}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => window.location.href = '/patient/wellness'}
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                More Tips
              </button>
            </div>
          </div>

          {/* Emergency Health Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <QrCode className="h-5 w-5" />
              <span>Emergency Health Card</span>
            </h3>
            <div className="text-center space-y-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg">
                <QrCode className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show this QR code to medical staff for instant access to your medical information
              </p>
              <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                View Details
              </button>
            </div>
          </div>

          {/* AI Chatbot */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <MessageCircle className="h-5 w-5" />
              <span>Health Assistant</span>
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask me about your appointments, medications, or general health questions.
              </p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Start Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}