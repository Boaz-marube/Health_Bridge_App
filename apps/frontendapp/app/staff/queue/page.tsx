'use client'

import { useState, useEffect } from 'react'
import { staffService } from '@/app/services/staff.service'
import { Users, Clock, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react'
import { formatName } from '@/app/lib/name-utils'

interface QueueItem {
  _id: string
  patientId: string
  patientName: string
  appointmentType: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'waiting' | 'in-progress' | 'completed'
  estimatedWaitTime: number
  checkInTime: string
}

export default function StaffQueuePage() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQueueData()
  }, [])

  const fetchQueueData = async () => {
    try {
      const data = await staffService.getQueueManagement()
      setQueueItems(data)
    } catch (error) {
      console.error('Error fetching queue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQueueStatus = async (queueId: string, status: string) => {
    try {
      await staffService.updateQueueStatus(queueId, status)
      await fetchQueueData()
    } catch (error) {
      console.error('Error updating queue status:', error)
    }
  }

  const fastTrackPatient = async (queueId: string) => {
    try {
      await staffService.fastTrackPatient(queueId)
      await fetchQueueData()
    } catch (error) {
      console.error('Error fast-tracking patient:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Queue Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage patient queue and appointments</p>
        </div>
        <button
          onClick={fetchQueueData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh Queue
        </button>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total in Queue</p>
              <p className="font-semibold text-gray-900 dark:text-white">{queueItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Waiting</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {queueItems.filter(item => item.status === 'waiting').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {queueItems.filter(item => item.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {queueItems.filter(item => item.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Queue</h2>
        </div>
        <div className="p-6">
          {queueItems.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No patients in queue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queueItems.map((item, index) => (
                <div key={item._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-bold text-gray-500 dark:text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {formatName(item.patientName)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.appointmentType} • Check-in: {new Date(item.checkInTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Est. wait time: {item.estimatedWaitTime} minutes
                    </div>
                    <div className="flex space-x-2">
                      {item.status === 'waiting' && (
                        <>
                          <button
                            onClick={() => updateQueueStatus(item._id, 'in-progress')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => fastTrackPatient(item._id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Fast Track
                          </button>
                        </>
                      )}
                      {item.status === 'in-progress' && (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}