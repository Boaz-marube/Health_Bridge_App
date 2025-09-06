'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, User } from 'lucide-react'
import { doctorService } from '@/app/services/doctor.service'

interface Appointment {
  _id: string
  patientId: {
    _id: string
    name: string
    email: string
  }
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchAppointments(parsedUser.id)
    }
  }, [])

  const fetchAppointments = async (doctorId: string) => {
    try {
      const data = await doctorService.getAppointments(doctorId)
      setAppointments(data)
    } catch (error) {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading appointments...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your patient appointments</p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">No appointments scheduled</h3>
            <p className="text-gray-600 dark:text-gray-400">Your appointment schedule is empty</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {appointment.patientId?.name || 'Unknown Patient'}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {appointment.appointmentType || 'General Consultation'}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.appointmentTime}</span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Notes: {appointment.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-500 rounded-full p-2">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}