'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { appointmentStatusService } from '@/app/services/appointment-status.service'
import { notificationService } from '@/app/services/notification.service'

interface MissedAppointment {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  doctorId: string
  doctorName: string
  originalDate: string
  originalTime: string
  appointmentType: string
  missedReason?: 'no_show' | 'emergency' | 'illness' | 'other'
  priority?: 'normal' | 'high' | 'urgent'
  rescheduleCount?: number
}

export default function RescheduleAppointmentsPage() {
  const [missedAppointments, setMissedAppointments] = useState<MissedAppointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<MissedAppointment | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [priorityAppointments, setPriorityAppointments] = useState<MissedAppointment[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchMissedAppointments()
    fetchPriorityAppointments()
  }, [])

  const fetchMissedAppointments = () => {
    // Get missed appointments from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    const missed = appointments.filter((apt: any) => apt.status === 'missed')
      .sort((a: any, b: any) => {
        // Sort by priority (urgent first, then high, then normal)
        const priorityOrder = { urgent: 3, high: 2, normal: 1 }
        return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1)
      })
    setMissedAppointments(missed)
  }

  const fetchPriorityAppointments = async () => {
    try {
      const priority = await appointmentStatusService.getPriorityAppointments()
      setPriorityAppointments(priority)
    } catch (error) {
      console.error('Failed to fetch priority appointments:', error)
    }
  }

  const handleReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTime) return

    setLoading(true)
    try {
      // Update appointment with new date/time
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
      const index = appointments.findIndex((apt: any) => apt.id === selectedAppointment.id)
      
      if (index !== -1) {
        appointments[index] = {
          ...appointments[index],
          appointmentDate: newDate,
          appointmentTime: newTime,
          status: 'scheduled'
        }
        localStorage.setItem('appointments', JSON.stringify(appointments))
      }

      // Update missed reason if provided
      if (selectedReason) {
        await appointmentStatusService.updateMissedReason(selectedAppointment.id, selectedReason as any)
      }

      // Send notification to patient
      await notificationService.createNotification({
        userId: selectedAppointment.patientId,
        userType: 'patient',
        title: 'Appointment Rescheduled',
        message: `Your appointment has been rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}. Please confirm your availability.`,
        type: 'appointment',
        priority: 'high'
      })

      // Send notification to doctor
      await notificationService.createNotification({
        userId: selectedAppointment.doctorId,
        userType: 'doctor',
        title: 'Appointment Rescheduled',
        message: `Appointment with ${selectedAppointment.patientName} has been rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}.`,
        type: 'appointment',
        priority: 'medium'
      })

      // Reset form and refresh list
      setSelectedAppointment(null)
      setNewDate('')
      setNewTime('')
      setSelectedReason('')
      fetchMissedAppointments()
      fetchPriorityAppointments()
      
    } catch (error) {
      console.error('Failed to reschedule appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reschedule Missed Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and reschedule missed patient appointments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missed Appointments List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Missed Appointments ({missedAppointments.length})
          </h2>
          
          <div className="space-y-3">
            {missedAppointments.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No missed appointments to reschedule
              </p>
            ) : (
              missedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAppointment?.id === appointment.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {appointment.patientName}
                        </h3>
                        {appointment.priority && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            appointment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            appointment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.patientEmail}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(appointment.originalDate).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{appointment.originalTime}</span>
                        </span>
                        {appointment.missedReason && (
                          <span className="text-red-600">
                            Reason: {appointment.missedReason.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reschedule Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Reschedule Appointment
          </h2>
          
          {selectedAppointment ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {selectedAppointment.patientName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dr. {selectedAppointment.doctorName} • {selectedAppointment.appointmentType}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Missed: {new Date(selectedAppointment.originalDate).toLocaleDateString()} at {selectedAppointment.originalTime}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Missed Reason (Optional)
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                >
                  <option value="">Select reason</option>
                  <option value="no_show">No Show</option>
                  <option value="emergency">Emergency</option>
                  <option value="illness">Illness</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleReschedule}
                disabled={!newDate || !newTime || loading}
                className="w-full text-white py-2 px-4 rounded-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)' }}
              >
                {loading ? 'Rescheduling...' : 'Reschedule Appointment'}
              </button>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Select a missed appointment to reschedule
            </p>
          )}
        </div>
      </div>
    </div>
  )
}