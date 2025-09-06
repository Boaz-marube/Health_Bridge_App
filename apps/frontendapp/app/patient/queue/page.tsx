'use client'

import { useState, useEffect } from 'react'
import { Clock, Users, MapPin, Bell, AlertTriangle } from 'lucide-react'
import { patientService } from '@/app/services/patient.service'

interface QueueStatus {
  position: number | null
  estimatedWaitTime: number
  status: 'not_in_queue' | 'waiting' | 'called' | 'in_progress'
  doctorName?: string
  appointmentTime?: string
  queueDate?: string
}

export default function PatientQueuePage() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchQueueStatus(parsedUser.id)
    }
  }, [])

  const fetchQueueStatus = async (patientId: string) => {
    const status = await patientService.getQueueStatus(patientId)
    setQueueStatus(status)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'called': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="h-5 w-5" />
      case 'called': return <Bell className="h-5 w-5" />
      case 'in_progress': return <Users className="h-5 w-5" />
      default: return <MapPin className="h-5 w-5" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'waiting': return 'You are in the queue. Please wait for your turn.'
      case 'called': return 'You have been called! Please proceed to the consultation room.'
      case 'in_progress': return 'Your consultation is in progress.'
      default: return 'You are not currently in any queue.'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading queue status...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Queue Status</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your position and wait time</p>
      </div>

      {/* Queue Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {queueStatus?.position ? (
          <div className="space-y-6">
            {/* Current Status */}
            <div className={`p-4 rounded-lg border ${getStatusColor(queueStatus.status)}`}>
              <div className="flex items-center space-x-3 mb-3">
                {getStatusIcon(queueStatus.status)}
                <h3 className="font-semibold text-lg">
                  {queueStatus.status === 'waiting' && 'Waiting in Queue'}
                  {queueStatus.status === 'called' && 'You\'ve Been Called!'}
                  {queueStatus.status === 'in_progress' && 'Consultation in Progress'}
                </h3>
              </div>
              <p className="text-sm">{getStatusMessage(queueStatus.status)}</p>
            </div>

            {/* Queue Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  #{queueStatus.position}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Your Position</div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {queueStatus.estimatedWaitTime}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Minutes Left</div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {queueStatus.doctorName || 'Dr. Smith'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Your Doctor</div>
              </div>
            </div>

            {/* Appointment Details */}
            {queueStatus.appointmentTime && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Appointment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Scheduled Time:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(queueStatus.appointmentTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {queueStatus.queueDate ? new Date(queueStatus.queueDate).toLocaleDateString() : 'Today'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Priority Alert */}
            {queueStatus.position <= 3 && queueStatus.status === 'waiting' && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <h4 className="font-medium text-orange-800 dark:text-orange-200">You're Next!</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Please stay nearby. You'll be called within the next few minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Instructions</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Please stay in the waiting area</li>
                <li>• You'll receive a notification when it's your turn</li>
                <li>• Have your ID and insurance card ready</li>
                <li>• Inform reception if you need to step away</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Not in Queue
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have any active queue position today.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/appointments'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Book an Appointment
            </button>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={() => user && fetchQueueStatus(user.id)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
        >
          <Clock className="h-4 w-4" />
          <span>Refresh Status</span>
        </button>
      </div>
    </div>
  )
}