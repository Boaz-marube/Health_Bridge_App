"use client"

import Link from 'next/link'
import { Calendar, Clock, Users, FileText, Pill, Heart, Plus, QrCode, Activity, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { queueService, QueuePatient, QueueStats } from '@/app/lib/queue-service'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

interface PatientDashboardProps {
  user: User
}

// Mock data for demo
const mockAppointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "2025-01-10",
    time: "10:30 AM",
    status: "confirmed",
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "General Medicine",
    date: "2025-01-15",
    time: "2:00 PM",
    status: "pending",
  },
]

const mockMedicalHistory = [
  {
    id: 1,
    date: "2024-12-20",
    doctor: "Dr. Sarah Johnson",
    diagnosis: "Routine Checkup",
    prescription: "Vitamin D supplements",
  },
  {
    id: 2,
    date: "2024-11-15",
    doctor: "Dr. Michael Chen",
    diagnosis: "Mild Hypertension",
    prescription: "Lisinopril 10mg daily",
  },
]

const mockReminders = [
  {
    id: 1,
    medication: "Lisinopril",
    time: "8:00 AM",
    taken: true,
  },
  {
    id: 2,
    medication: "Vitamin D",
    time: "6:00 PM",
    taken: false,
  },
]

export default function PatientDashboard({ user }: PatientDashboardProps) {
  const [queuePosition, setQueuePosition] = useState(3)
  const [estimatedWait, setEstimatedWait] = useState(25)
  const [queueData, setQueueData] = useState<QueuePatient[]>([])
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null)
  const [currentPatient, setCurrentPatient] = useState<QueuePatient | null>(null)

  useEffect(() => {
    // Subscribe to queue updates
    const unsubscribe = queueService.subscribe((queue, stats) => {
      setQueueData(queue)
      setQueueStats(stats)
      
      // Find current patient (assuming P002 is John Smith)
      const patient = queue.find(p => p.id === 'P002')
      if (patient) {
        setCurrentPatient(patient)
        setQueuePosition(queueService.getPatientPosition('P002'))
        setEstimatedWait(patient.waitTime)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's your health overview for today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Next Appointment</p>
              <p className="font-semibold text-gray-900 dark:text-white">Jan 10, 10:30 AM</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Queue Position</p>
              <p className="font-semibold text-gray-900 dark:text-white">#{queuePosition}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Est. Wait Time</p>
              <p className="font-semibold text-gray-900 dark:text-white">{estimatedWait} min</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Medications</p>
              <p className="font-semibold text-gray-900 dark:text-white">2 Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Queue Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5" />
              <span>Current Queue Status</span>
            </h3>
            
            {currentPatient ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Position</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">#{queuePosition}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Wait</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{estimatedWait} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      currentPatient.status === 'waiting' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : currentPatient.status === 'checked-in'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {currentPatient.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {currentPatient.estimatedCallTime && (
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estimated call time</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {currentPatient.estimatedCallTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
                
                {queueService.shouldNotifyPatient('P002') && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded">
                    <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                      🔔 You'll be called soon! Please stay nearby.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No active queue position</p>
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Appointments</span>
              </h3>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
                <Plus className="h-4 w-4" />
                <span>Book New</span>
              </button>
            </div>
            <div className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white">{appointment.doctor}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.specialty}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      appointment.status === "confirmed" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}>
                      {appointment.status}
                    </span>
                    <div>
                      <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5" />
              <span>Recent Medical History</span>
            </h3>
            <div className="space-y-4">
              {mockMedicalHistory.map((record) => (
                <div key={record.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white">{record.diagnosis}</p>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{record.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{record.doctor}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Prescription: {record.prescription}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              View Full History
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Medicine Reminders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Pill className="h-5 w-5" />
              <span>Today's Medications</span>
            </h3>
            <div className="space-y-3">
              {mockReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{reminder.medication}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{reminder.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reminder.taken 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}>
                    {reminder.taken ? "Taken" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Set Reminder</span>
            </button>
          </div>

          {/* Wellness Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <Heart className="h-5 w-5" />
              <span>Today's Wellness Tip</span>
            </h3>
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">Stay Hydrated</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Aim for 8 glasses of water today. Proper hydration helps your body function optimally and
                      supports recovery.
                    </p>
                  </div>
                </div>
              </div>
              <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                More Tips
              </button>
            </div>
          </div>

          {/* Emergency Health Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <QrCode className="h-5 w-5" />
              <span>Emergency Health Card</span>
            </h3>
            <div className="text-center space-y-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg">
                <QrCode className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show this QR code to medical staff for instant access to your medical information
              </p>
              <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                View Details
              </button>
            </div>
          </div>

          {/* AI Chatbot */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
              <MessageCircle className="h-5 w-5" />
              <span>Health Assistant</span>
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask me about your appointments, medications, or general health questions.
              </p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Start Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}