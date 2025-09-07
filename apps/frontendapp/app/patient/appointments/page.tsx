'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, User, Search } from 'lucide-react'
import { patientService } from '@/app/services/patient.service'
import { useWebSocket } from '@/app/hooks/useWebSocket'
import AppointmentListSkeleton from '@/app/components/skeletons/AppointmentListSkeleton'
import { businessHoursService } from '@/app/services/business-hours.service'

interface Appointment {
  _id: string
  doctorId: {
    _id: string
    name: string
    specialization: string
  }
  appointmentDate: string
  appointmentTime: string
  appointmentType: string
  status: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
}

interface Doctor {
  _id: string
  name: string
  specialization: string
  department: string
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation'
  })
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([])
  const [showReschedule, setShowReschedule] = useState(false)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null)
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' })
  const [notifications, setNotifications] = useState<string[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchData(parsedUser.id)
    }
  }, [])

  // WebSocket for real-time updates
  useWebSocket({
    userId: user?.id || '',
    onAppointmentUpdate: (data) => {
      // Update appointments when status changes
      setAppointments(prev => prev.map(apt => 
        apt._id === data.appointmentId 
          ? { ...apt, status: data.status }
          : apt
      ))
      // Show notification
      setNotifications(prev => [...prev, data.message])
      setTimeout(() => {
        setNotifications(prev => prev.slice(1))
      }, 5000)
    }
  })

  const fetchData = async (patientId: string) => {
    const [appointmentsData, doctorsData] = await Promise.all([
      patientService.getAppointments(patientId),
      patientService.getDoctors()
    ])
    setAppointments(appointmentsData)
    setDoctors(doctorsData)
    setLoading(false)
  }

  const handleBookAppointment = async () => {
    if (!user || !bookingData.doctorId || !bookingData.date || !bookingData.time) return

    try {
      await patientService.bookAppointment({
        doctorId: bookingData.doctorId,
        appointmentDate: bookingData.date,
        appointmentTime: bookingData.time,
        appointmentType: bookingData.type
      })
      
      await fetchData(user.id)
      setShowBooking(false)
      setBookingData({ doctorId: '', date: '', time: '', type: 'consultation' })
    } catch (error) {
      console.error('Failed to book appointment:', error)
    }
  }

  const handleRescheduleAppointment = async () => {
    if (!rescheduleAppointment || !rescheduleData.date || !rescheduleData.time) return

    try {
      await patientService.rescheduleAppointment(rescheduleAppointment._id, {
        appointmentDate: rescheduleData.date,
        appointmentTime: rescheduleData.time
      })
      
      await fetchData(user.id)
      setShowReschedule(false)
      setRescheduleAppointment(null)
      setRescheduleData({ date: '', time: '' })
    } catch (error) {
      console.error('Failed to reschedule appointment:', error)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    
    try {
      await patientService.cancelAppointment(appointmentId)
      await fetchData(user.id)
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
    }
  }

  const openRescheduleModal = (appointment: Appointment) => {
    setRescheduleAppointment(appointment)
    setRescheduleData({
      date: new Date(appointment.appointmentDate).toISOString().split('T')[0],
      time: appointment.appointmentTime
    })
    setShowReschedule(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    if (bookingData.date) {
      const selectedDate = new Date(bookingData.date)
      const slots = businessHoursService.getAvailableTimeSlots(selectedDate)
      setAvailableTimeSlots(slots)
    } else {
      setAvailableTimeSlots([])
    }
  }, [bookingData.date])

  useEffect(() => {
    if (rescheduleData.date) {
      const selectedDate = new Date(rescheduleData.date)
      const slots = businessHoursService.getAvailableTimeSlots(selectedDate)
      setAvailableTimeSlots(slots)
    }
  }, [rescheduleData.date])



  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div key={index} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
              {notification}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400">Book and manage your medical appointments</p>
        </div>
        <button
          onClick={() => setShowBooking(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {loading ? (
          <AppointmentListSkeleton />
        ) : appointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">No appointments scheduled</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Book your first appointment to get started</p>
            <button
              onClick={() => setShowBooking(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Book Appointment
            </button>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {appointment.doctorId?.name || 'Unknown Doctor'}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {appointment.doctorId?.specialization || 'General Practice'}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Notes: {appointment.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <>
                      <button 
                        onClick={() => openRescheduleModal(appointment)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {appointment.status === 'pending' && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      Awaiting confirmation
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Book New Appointment</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Doctor
                </label>
                <select
                  value={bookingData.doctorId}
                  onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => {
                    setBookingData({ ...bookingData, date: e.target.value, time: '' })
                  }}
                  min={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />

              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Time
                </label>
                {!bookingData.date ? (
                  <p className="text-sm text-gray-500 py-4">Please select a date first</p>
                ) : availableTimeSlots.length === 0 ? (
                  <p className="text-sm text-red-600 py-4">No available time slots for this date</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setBookingData({ ...bookingData, time: slot.time })}
                        disabled={!slot.available}
                        title={slot.reason}
                        className={`py-2 px-3 rounded text-sm font-medium ${
                          bookingData.time === slot.time
                            ? 'bg-blue-500 text-white'
                            : slot.available
                            ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            : 'border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        {businessHoursService.formatTimeSlot(slot.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appointment Type
                </label>
                <select
                  value={bookingData.type}
                  onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="checkup">Regular Checkup</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
              <button
                onClick={() => setShowBooking(false)}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={!bookingData.doctorId || !bookingData.date || !bookingData.time}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 rounded-lg"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showReschedule && rescheduleAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reschedule Appointment with {rescheduleAppointment.doctorId?.name}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Time
                </label>
                {!rescheduleData.date ? (
                  <p className="text-sm text-gray-500 py-4">Please select a date first</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setRescheduleData({ ...rescheduleData, time: slot.time })}
                        disabled={!slot.available}
                        title={slot.reason}
                        className={`py-2 px-3 rounded text-sm font-medium ${
                          rescheduleData.time === slot.time
                            ? 'bg-blue-500 text-white'
                            : slot.available
                            ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            : 'border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        {businessHoursService.formatTimeSlot(slot.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
              <button
                onClick={() => {
                  setShowReschedule(false)
                  setRescheduleAppointment(null)
                  setRescheduleData({ date: '', time: '' })
                }}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleAppointment}
                disabled={!rescheduleData.date || !rescheduleData.time}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 rounded-lg"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}