'use client'

import { useState, useEffect } from 'react'
import { Clock, Users, Play, CheckCircle, AlertTriangle, X } from 'lucide-react'
import { queueService } from '@/app/services/queue.service'
import { useWebSocket } from '@/app/hooks/useWebSocket'
import StatCardSkeleton from '@/app/components/skeletons/StatCardSkeleton'
import QueueSkeleton from '@/app/components/skeletons/QueueSkeleton'

interface QueueItem {
  _id: string
  patientId: {
    _id: string
    name: string
    email: string
  }
  position: number
  status: string
  priority: number
  estimatedWaitTime: number
  arrivalTime: string
  appointmentId?: string
}

export default function DoctorQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchQueue(parsedUser.id)
    }
  }, [])

  const fetchQueue = async (doctorId: string) => {
    const queueData = await queueService.getDoctorQueue(doctorId)
    setQueue(queueData)
    setLoading(false)
  }

  // WebSocket for real-time queue updates
  useWebSocket({
    userId: user?.id || '',
    onQueueUpdate: () => {
      if (user?.id) {
        fetchQueue(user.id)
      }
    }
  })

  const handleCallNext = async () => {
    if (!user?.id) return
    
    try {
      await queueService.callNextPatient(user.id)
      await fetchQueue(user.id)
    } catch (error) {
      console.error('Failed to call next patient:', error)
    }
  }

  const handleCompleteConsultation = async (queueId: string) => {
    try {
      await queueService.completeConsultation(queueId)
      await fetchQueue(user.id)
    } catch (error) {
      console.error('Failed to complete consultation:', error)
    }
  }

  const handleFastTrack = async (queueId: string) => {
    try {
      await queueService.fastTrackPatient(queueId)
      await fetchQueue(user.id)
    } catch (error) {
      console.error('Failed to fast track patient:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return { label: 'Emergency', color: 'text-red-600', icon: '🚨' }
      case 2: return { label: 'Appointment', color: 'text-blue-600', icon: '📅' }
      case 3: return { label: 'Walk-in', color: 'text-gray-600', icon: '🚶' }
      default: return { label: 'Unknown', color: 'text-gray-600', icon: '❓' }
    }
  }

  const waitingPatients = queue.filter(item => item.status === 'waiting')
  const inProgressPatient = queue.find(item => item.status === 'in_progress')
  const completedToday = queue.filter(item => item.status === 'completed').length



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Queue</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your patient queue and consultations</p>
        </div>
        <button
          onClick={handleCallNext}
          disabled={waitingPatients.length === 0 || !!inProgressPatient}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Play className="h-4 w-4" />
          <span>Call Next Patient</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Waiting</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{waitingPatients.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{inProgressPatient ? 1 : 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{completedToday}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Wait Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {waitingPatients.length > 0 ? Math.round(waitingPatients.reduce((acc, p) => acc + p.estimatedWaitTime, 0) / waitingPatients.length) : 0} min
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Current Patient */}
      {inProgressPatient && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Patient</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{inProgressPatient.patientId.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{inProgressPatient.patientId.email}</p>
            </div>
            <button
              onClick={() => handleCompleteConsultation(inProgressPatient._id)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Complete</span>
            </button>
          </div>
        </div>
      )}

      {/* Queue List */}
      {loading ? (
        <QueueSkeleton />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Waiting Queue</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {waitingPatients.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No patients in queue
              </div>
            ) : (
              waitingPatients.map((item) => {
                const priority = getPriorityLabel(item.priority)
                return (
                  <div key={item._id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {item.position}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.patientId.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.patientId.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs ${priority.color}`}>
                            {priority.icon} {priority.label}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ~{item.estimatedWaitTime} min
                      </span>
                      {item.priority !== 1 && (
                        <button
                          onClick={() => handleFastTrack(item._id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Fast Track
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}