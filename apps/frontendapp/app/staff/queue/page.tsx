'use client'

import { useState, useEffect } from 'react'
import { Users, RefreshCw, Plus, ArrowUp, X, AlertTriangle } from 'lucide-react'
import { queueService } from '@/app/services/queue.service'
import { apiService } from '@/app/services/api.service'
import QueueSkeleton from '@/app/components/skeletons/QueueSkeleton'

export default function StaffQueuePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [allQueues, setAllQueues] = useState<any[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [doctors, setDoctors] = useState<any[]>([])

  const handleSyncAppointments = async () => {
    setLoading(true)
    try {
      const result = await apiService.post('/queue/sync-appointments')
      setMessage(result.message || 'Successfully synced today\'s appointments to queue!')
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      setMessage('Failed to sync appointments')
      setTimeout(() => setMessage(''), 5000)
    }
    setLoading(false)
  }

  const fetchDoctors = async () => {
    try {
      const doctorsList = await apiService.get('/doctors')
      setDoctors(doctorsList)
      if (doctorsList.length > 0) {
        setSelectedDoctor(doctorsList[0]._id)
        fetchQueueForDoctor(doctorsList[0]._id)
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    }
  }

  const fetchQueueForDoctor = async (doctorId: string) => {
    try {
      const queueData = await queueService.getDoctorQueue(doctorId)
      setAllQueues(queueData)
    } catch (error) {
      console.error('Failed to fetch queue:', error)
      setAllQueues([])
    }
  }

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctor(doctorId)
    fetchQueueForDoctor(doctorId)
  }

  const handleFastTrack = async (queueId: string) => {
    try {
      await queueService.fastTrackPatient(queueId)
      setMessage('Patient moved to emergency priority')
      fetchQueueForDoctor(selectedDoctor)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to fast track patient')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleRemoveFromQueue = async (queueId: string) => {
    try {
      await queueService.removeFromQueue(queueId)
      setMessage('Patient removed from queue')
      fetchQueueForDoctor(selectedDoctor)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to remove patient from queue')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Queue Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage patient queues and sync appointments</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-3 rounded text-sm sm:text-base">
          {message}
        </div>
      )}

      {/* Sync Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Sync Today's Appointments
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
          Add all confirmed appointments for today to their respective doctor queues.
        </p>
        <button
          onClick={handleSyncAppointments}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync Appointments to Queue'}</span>
          <span className="sm:hidden">{loading ? 'Syncing...' : 'Sync Queue'}</span>
        </button>
      </div>

      {/* Queue Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Queue Management
        </h3>
        
        {/* Doctor Selection */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Doctor
          </label>
          <select
            value={selectedDoctor}
            onChange={(e) => handleDoctorChange(e.target.value)}
            className="w-full p-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Queue Display */}
        <div className="space-y-3 sm:space-y-4">
          {allQueues.length === 0 ? (
            <div className="text-center py-6 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              No patients in queue for selected doctor
            </div>
          ) : (
            allQueues.map((queueItem) => (
              <div key={queueItem._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0">
                    {queueItem.position}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                      {queueItem.patientId?.name || 'Unknown Patient'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                      {queueItem.patientId?.email || 'No email'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        queueItem.priority === 'emergency' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        queueItem.priority === 'appointment' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        <span className="hidden sm:inline">
                          {queueItem.priority === 'emergency' ? '🚨 Emergency' :
                           queueItem.priority === 'appointment' ? '📅 Appointment' : '🚶 Walk-in'}
                        </span>
                        <span className="sm:hidden">
                          {queueItem.priority === 'emergency' ? '🚨' :
                           queueItem.priority === 'appointment' ? '📅' : '🚶'}
                        </span>
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        queueItem.status === 'waiting' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        queueItem.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {queueItem.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    ~{queueItem.estimatedWaitTime || 0} min
                  </span>
                  
                  {queueItem.status === 'waiting' && (
                    <div className="flex items-center space-x-2">
                      {queueItem.priority !== 'emergency' && (
                        <button
                          onClick={() => handleFastTrack(queueItem._id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center space-x-1"
                          title="Move to Emergency Priority"
                        >
                          <ArrowUp className="h-3 w-3" />
                          <span className="hidden sm:inline">Emergency</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleRemoveFromQueue(queueItem._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center space-x-1"
                        title="Remove from Queue"
                      >
                        <X className="h-3 w-3" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}