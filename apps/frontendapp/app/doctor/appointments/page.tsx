'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, User } from 'lucide-react'
import { doctorService } from '@/app/services/doctor.service'
import AppointmentListSkeleton from '@/app/components/skeletons/AppointmentListSkeleton'
import { appointmentStatusService } from '@/app/services/appointment-status.service'

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
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed'
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
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'missed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }



  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your patient appointments</p>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {loading ? (
          <AppointmentListSkeleton />
        ) : appointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 text-center">
            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">No appointments scheduled</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Your appointment schedule is empty</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {appointment.patientId?.name || 'Unknown Patient'}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)} self-start sm:self-auto`}>
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {appointment.appointmentType || 'General Consultation'}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>{appointment.appointmentTime}</span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span className="font-medium">Notes:</span> {appointment.notes}
                    </p>
                  )}
                </div>
                {appointment.status === 'scheduled' && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:flex-shrink-0">
                    <button 
                      onClick={() => {
                        appointmentStatusService.completeAppointment(appointment._id)
                        fetchAppointments(user.id)
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-xs sm:text-sm transition-colors"
                    >
                      Complete
                    </button>
                    <button 
                      onClick={() => {
                        appointmentStatusService.cancelAppointment(appointment._id)
                        fetchAppointments(user.id)
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-xs sm:text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}