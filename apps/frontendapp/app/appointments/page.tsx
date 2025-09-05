"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/app/components/layout/sidebar"
import { Calendar, Clock, Plus, AlertCircle, CheckCircle, X } from "lucide-react"

const mockDoctors = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology", available: true },
  { id: 2, name: "Dr. Michael Chen", specialty: "General Medicine", available: true },
  { id: 3, name: "Dr. Emily Davis", specialty: "Dermatology", available: false },
]

const mockTimeSlots = [
  { time: "9:00 AM", available: true },
  { time: "10:30 AM", available: false },
  { time: "2:00 PM", available: true },
  { time: "3:30 PM", available: true },
]

export default function AppointmentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    department: "",
    doctor: "",
    date: "",
    time: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const mockAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      date: "2025-01-10",
      time: "10:30 AM",
      status: "confirmed",
      canReschedule: true,
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "General Medicine",
      date: "2025-01-15",
      time: "2:00 PM",
      status: "pending",
      canReschedule: true,
    },
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  const validateBooking = () => {
    const newErrors: Record<string, string> = {}

    if (!bookingData.department) newErrors.department = "Please select a department"
    if (!bookingData.doctor) newErrors.doctor = "Please select a doctor"
    if (!bookingData.date) newErrors.date = "Please select a date"
    if (!bookingData.time) newErrors.time = "Please select a time slot"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBooking = async () => {
    if (!validateBooking()) return

    setIsLoading(true)
    // Simulate booking API call
    setTimeout(() => {
      setIsLoading(false)
      // Check for double booking
      const isDoubleBooked = bookingData.time === "10:30 AM"
      if (isDoubleBooked) {
        setErrors({ time: "This time slot is already taken." })
        return
      }

      setBookingStep(4) // Success
      setTimeout(() => {
        setShowBooking(false)
        setBookingStep(1)
        setBookingData({ department: "", doctor: "", date: "", time: "" })
      }, 2000)
    }, 1500)
  }

  const handleReschedule = (appointmentId: number) => {
    const appointment = mockAppointments.find((a) => a.id === appointmentId)
    if (!appointment) return

    // Check if within 24h
    const appointmentDate = new Date(appointment.date)
    const now = new Date()
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursDiff < 24) {
      setErrors({ reschedule: "Appointments can only be rescheduled up to 24h in advance." })
      return
    }

    // Open reschedule flow
    setShowBooking(true)
    setBookingStep(1)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar userType={user.userType} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your medical appointments</p>
            </div>
            <button 
              onClick={() => setShowBooking(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Error Display */}
          {errors.reschedule && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200">{errors.reschedule}</span>
            </div>
          )}

          {/* Appointments List */}
          <div className="grid gap-4">
            {mockAppointments.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">No appointments scheduled</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Book your first appointment to get started</p>
                <button 
                  onClick={() => setShowBooking(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Book Appointment</span>
                </button>
              </div>
            ) : (
              mockAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{appointment.doctor}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          appointment.status === "confirmed" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{appointment.specialty}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-x-2">
                      {appointment.canReschedule && (
                        <button 
                          onClick={() => handleReschedule(appointment.id)}
                          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Reschedule
                        </button>
                      )}
                      <button className="border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-3 py-1 rounded text-sm hover:bg-red-50 dark:hover:bg-red-900/20">
                        Cancel
                      </button>
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
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {bookingStep === 1 && "Select Department"}
                      {bookingStep === 2 && "Choose Doctor"}
                      {bookingStep === 3 && "Pick Date & Time"}
                      {bookingStep === 4 && "Booking Confirmed!"}
                    </h2>
                    <button 
                      onClick={() => setShowBooking(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {bookingStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                        <select
                          value={bookingData.department}
                          onChange={(e) => setBookingData({ ...bookingData, department: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select department</option>
                          <option value="cardiology">Cardiology</option>
                          <option value="general">General Medicine</option>
                          <option value="dermatology">Dermatology</option>
                        </select>
                        {errors.department && <p className="text-sm text-red-600 dark:text-red-400">{errors.department}</p>}
                      </div>
                      <button 
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 rounded-lg" 
                        onClick={() => setBookingStep(2)} 
                        disabled={!bookingData.department}
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {bookingStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {mockDoctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              bookingData.doctor === doctor.name 
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            } ${!doctor.available ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() =>
                              doctor.available && setBookingData({ ...bookingData, doctor: doctor.name })
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{doctor.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
                              </div>
                              {!doctor.available && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.doctor && <p className="text-sm text-red-600 dark:text-red-400">{errors.doctor}</p>}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setBookingStep(1)}
                          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Back
                        </button>
                        <button 
                          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 rounded-lg" 
                          onClick={() => setBookingStep(3)} 
                          disabled={!bookingData.doctor}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  {bookingStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                        <input
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {errors.date && <p className="text-sm text-red-600 dark:text-red-400">{errors.date}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Slot</label>
                        <div className="grid grid-cols-2 gap-2">
                          {mockTimeSlots.map((slot) => (
                            <button
                              key={slot.time}
                              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                bookingData.time === slot.time
                                  ? "bg-blue-500 text-white"
                                  : slot.available
                                  ? "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  : "border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              }`}
                              disabled={!slot.available}
                              onClick={() => setBookingData({ ...bookingData, time: slot.time })}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                        {errors.time && <p className="text-sm text-red-600 dark:text-red-400">{errors.time}</p>}
                      </div>

                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setBookingStep(2)}
                          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Back
                        </button>
                        <button 
                          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 rounded-lg" 
                          onClick={handleBooking} 
                          disabled={isLoading}
                        >
                          {isLoading ? "Booking..." : "Confirm Booking"}
                        </button>
                      </div>
                    </div>
                  )}

                  {bookingStep === 4 && (
                    <div className="text-center space-y-4">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                      <div>
                        <h3 className="font-semibold text-green-700 dark:text-green-400">Appointment Booked!</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Confirmation sent via app and SMS</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}