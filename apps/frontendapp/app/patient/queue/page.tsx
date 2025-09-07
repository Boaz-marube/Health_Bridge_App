'use client'

import { useState, useEffect } from 'react'
import { Clock, Users, CheckCircle } from 'lucide-react'
import { queueService, QueueStatus, QueuePriority } from '@/app/services/queue.service'
import { patientService } from '@/app/services/patient.service'
import { useWebSocket } from '@/app/hooks/useWebSocket'
import StatCardSkeleton from '@/app/components/skeletons/StatCardSkeleton'
import AppointmentSkeleton from '@/app/components/skeletons/AppointmentSkeleton'

export default function PatientQueuePage() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({ position: null, estimatedWaitTime: 0, status: 'not_in_queue' })
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchData(parsedUser.id)
    }
  }, [])

  const fetchData = async (userId: string) => {
    const [queueData, appointmentsData] = await Promise.all([
      queueService.getPatientQueueStatus(),
      patientService.getAppointments(userId)
    ])
    
    // Filter for today's confirmed appointments
    const today = new Date().toISOString().split('T')[0]
    const todaysAppointments = appointmentsData.filter((apt: any) => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0]
      return aptDate === today && (apt.status === 'confirmed' || apt.status === 'scheduled')
    })
    
    setQueueStatus(queueData)
    setAppointments(todaysAppointments)
    setLoading(false)
  }

  // WebSocket for real-time queue updates
  useWebSocket({
    userId: user?.id || '',
    onQueueUpdate: (data) => {
      setQueueStatus(prev => ({ ...prev, ...data }))
    }
  })

  const handleJoinQueue = async (doctorId: string, appointmentId?: string) => {
    try {
      await queueService.joinQueue(doctorId, QueuePriority.APPOINTMENT, appointmentId)
      await fetchData(user.id)
    } catch (error) {
      console.error('Failed to join queue:', error)
    }
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Queue Status</h1>
        <p className="text-gray-600 dark:text-gray-400">Check your position and join queues</p>
      </div>

      {/* Current Queue Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Queue Status</h3>
        
        {queueStatus.status === 'not_in_queue' ? (
          <div className="text-center py-6">
            <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">You are not currently in any queue</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                #{queueStatus.position || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Position in Queue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {queueStatus.estimatedWaitTime || 0} min
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Wait</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                queueStatus.status === 'waiting' ? 'text-yellow-600' : 
                queueStatus.status === 'in_progress' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {queueStatus.status === 'waiting' ? 'Waiting' :
                 queueStatus.status === 'in_progress' ? 'Called' : 'Ready'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            </div>
          </div>
        )}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Appointments</h3>
        
        {appointments.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {appointment.doctorId?.name || 'Doctor'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {appointment.appointmentTime} - {appointment.appointmentType}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
                
                {queueStatus.status === 'not_in_queue' && (
                  <button
                    onClick={() => handleJoinQueue(appointment.doctorId._id, appointment._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>Join Queue</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}