'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, User, Search, Edit, Trash2 } from 'lucide-react'
import { staffService } from '@/app/services/staff.service'
import AppointmentListSkeleton from '@/app/components/skeletons/AppointmentListSkeleton'

interface Appointment {
  _id: string
  patientId: {
    _id: string
    name: string
    email: string
  }
  doctorId: {
    _id: string
    name: string
    specialization: string
  }
  appointmentDate: string
  appointmentTime: string
  appointmentType: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
}

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [bookingData, setBookingData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation',
    notes: ''
  })
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const appointmentsPerPage = 7

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [appointmentsData, doctorsData, patientsData] = await Promise.all([
      staffService.getAllAppointments(),
      staffService.getDoctors(),
      staffService.getPatients()
    ])
    setAppointments(appointmentsData)
    setDoctors(doctorsData)
    setPatients(patientsData)
    setLoading(false)
  }

  const handleBookAppointment = async () => {
    if (!bookingData.patientId || !bookingData.doctorId || !bookingData.date || !bookingData.time) return

    try {
      if (editingAppointment) {
        await staffService.updateAppointment(editingAppointment._id, {
          patientId: bookingData.patientId,
          doctorId: bookingData.doctorId,
          appointmentDate: bookingData.date,
          appointmentTime: bookingData.time,
          appointmentType: bookingData.type,
          notes: bookingData.notes
        })
      } else {
        await staffService.bookAppointment({
          patientId: bookingData.patientId,
          doctorId: bookingData.doctorId,
          appointmentDate: bookingData.date,
          appointmentTime: bookingData.time,
          appointmentType: bookingData.type,
          notes: bookingData.notes
        })
      }
      
      await fetchData()
      setShowBooking(false)
      setShowEdit(false)
      setEditingAppointment(null)
      setBookingData({ patientId: '', doctorId: '', date: '', time: '', type: 'consultation', notes: '' })
    } catch (error) {
      console.error('Failed to save appointment:', error)
    }
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setBookingData({
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId._id,
      date: new Date(appointment.appointmentDate).toISOString().split('T')[0],
      time: appointment.appointmentTime,
      type: appointment.appointmentType,
      notes: appointment.notes || ''
    })
    setShowEdit(true)
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    
    try {
      await staffService.cancelAppointment(appointmentId)
      await fetchData()
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to permanently delete this appointment?')) return
    
    try {
      await staffService.deleteAppointment(appointmentId)
      await fetchData()
    } catch (error) {
      console.error('Failed to delete appointment:', error)
    }
  }

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await staffService.confirmAppointment(appointmentId)
      await fetchData()
    } catch (error) {
      console.error('Failed to confirm appointment:', error)
    }
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

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage)
  const startIndex = (currentPage - 1) * appointmentsPerPage
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + appointmentsPerPage)

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Appointment Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Book, reschedule, and manage patient appointments</p>
        </div>
        <button
          onClick={() => setShowBooking(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Book Appointment</span>
          <span className="sm:hidden">Book</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search patients or doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {loading ? (
          <AppointmentListSkeleton />
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">No appointments found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          paginatedAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {appointment.patientId?.name || 'Unknown Patient'}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium self-start ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Doctor: {appointment.doctorId?.name || 'Unknown Doctor'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {appointment.doctorId?.specialization || 'General Practice'}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{appointment.appointmentTime}</span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Notes: {appointment.notes}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:items-center sm:space-x-2">
                  {appointment.status === 'cancelled' ? (
                    <button 
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center space-x-1 min-w-0"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  ) : (
                    <>
                      {appointment.status === 'pending' && (
                        <button 
                          onClick={() => handleConfirmAppointment(appointment._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center space-x-1 min-w-0"
                        >
                          <span>✓</span>
                          <span className="hidden sm:inline">Confirm</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleEditAppointment(appointment)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center space-x-1 min-w-0"
                      >
                        <Edit className="h-3 w-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center space-x-1 min-w-0"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
            Showing {startIndex + 1} to {Math.min(startIndex + appointmentsPerPage, filteredAppointments.length)} of {filteredAppointments.length} appointments
          </div>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Booking/Edit Modal */}
      {(showBooking || showEdit) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
              </h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Patient
                </label>
                <select
                  value={bookingData.patientId}
                  onChange={(e) => setBookingData({ ...bookingData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>

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
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setBookingData({ ...bookingData, time })}
                      className={`py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium ${
                        bookingData.time === time
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
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

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowBooking(false)
                  setShowEdit(false)
                  setEditingAppointment(null)
                  setBookingData({ patientId: '', doctorId: '', date: '', time: '', type: 'consultation', notes: '' })
                }}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={!bookingData.patientId || !bookingData.doctorId || !bookingData.date || !bookingData.time}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm sm:text-base"
              >
                <span className="hidden sm:inline">{editingAppointment ? 'Update Appointment' : 'Book Appointment'}</span>
                <span className="sm:hidden">{editingAppointment ? 'Update' : 'Book'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}