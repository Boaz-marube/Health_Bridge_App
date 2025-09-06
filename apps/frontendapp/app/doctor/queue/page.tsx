'use client'

import { useState, useEffect } from 'react'
import { Clock, Users, AlertTriangle, CheckCircle, User } from 'lucide-react'
import { doctorService } from '@/app/services/doctor.service'

interface QueueItem {
  _id: string
  patientId: {
    _id: string
    name: string
    email: string
  }
  position: number
  priority: 'normal' | 'priority' | 'emergency'
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
  estimatedWaitTime: number
  notes?: string
  checkedInAt?: string
}

export default function QueuePage() {
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
    const today = new Date().toISOString().split('T')[0]
    const data = await doctorService.getQueue(doctorId, today)
    setQueue(data)
    setLoading(false)
  }

  const updateQueueStatus = async (queueId: string, status: string) => {
    try {
      await doctorService.updateQueueStatus(queueId, status)
      if (user) {
        fetchQueue(user.id)
      }
    } catch (error) {
      console.error('Failed to update queue status:', error)
    }
  }

  const fastTrackPatient = async (queueId: string) => {
    try {
      await doctorService.fastTrackPatient(queueId)
      if (user) {
        fetchQueue(user.id)
      }
    } catch (error) {
      console.error('Failed to fast-track patient:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200'
      case 'priority': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading queue...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Queue</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your patient queue for today</p>
        </div>
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          <span className="font-semibold">{queue.length}</span> patients in queue
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {queue.filter(q => q.status === 'waiting').length}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Waiting</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {queue.filter(q => q.status === 'in_progress').length}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {queue.filter(q => q.priority === 'emergency').length}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Emergency</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {queue.filter(q => q.status === 'completed').length}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Queue</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {queue.map((item) => (
            <div key={item._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {item.position}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.patientId?.name || 'Unknown Patient'}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                        {item.priority === 'emergency' ? '🚨 Emergency' : 
                         item.priority === 'priority' ? '⚡ Priority' : '📋 Normal'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.patientId?.email}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <div className="flex space-x-2">
                    {item.status === 'waiting' && (
                      <>
                        <button
                          onClick={() => updateQueueStatus(item._id, 'in_progress')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => fastTrackPatient(item._id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Fast Track
                        </button>
                      </>
                    )}
                    {item.status === 'in_progress' && (
                      <button
                        onClick={() => updateQueueStatus(item._id, 'completed')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {queue.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No patients in queue</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your queue is empty for today
          </p>
        </div>
      )}
    </div>
  )
}