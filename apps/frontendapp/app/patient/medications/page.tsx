'use client'

import { useState, useEffect } from 'react'
import { Pill, Clock, Plus, Bell } from 'lucide-react'
import { patientService } from '@/app/services/patient.service'

interface Medication {
  _id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  status: 'active' | 'completed' | 'paused'
  nextDose?: string
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchMedications(parsedUser.id)
    }
  }, [])

  const fetchMedications = async (patientId: string) => {
    const data = await patientService.getPrescriptions(patientId)
    setMedications(data)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading medications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Medications</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your medications and set reminders</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Today's Medications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Today's Schedule</span>
        </h3>
        <div className="space-y-3">
          {medications.filter(med => med.status === 'active').slice(0, 3).map((medication, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 rounded-full p-2">
                  <Pill className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{medication.name || 'Medication'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{medication.dosage || '10mg'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">8:00 AM</p>
                <button className="text-xs text-blue-600 hover:text-blue-700">Mark as taken</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Medications */}
      <div className="grid gap-4">
        {medications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <Pill className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">No medications found</h3>
            <p className="text-gray-600 dark:text-gray-400">Your medication list is empty</p>
          </div>
        ) : (
          medications.map((medication, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {medication.name || `Medication ${index + 1}`}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(medication.status || 'active')}`}>
                      {medication.status || 'active'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {medication.dosage || '10mg'} - {medication.frequency || 'Daily'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Duration: {medication.duration || '30 days'}
                  </p>
                  {medication.instructions && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Instructions: {medication.instructions}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
                    <Bell className="h-3 w-3" />
                    <span>Remind</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}