"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { doctorService } from '@/app/services/doctor.service'
import { patientService } from '@/app/services/patient.service'
import { staffService } from '@/app/services/staff.service'
import { formatPatientName, formatDoctorName } from '@/app/lib/name-utils'
import {
  Calendar,
  Users,
  FileText,
  Pill,
  Heart,
  MessageCircle,
  Settings,
  LogOut,
  Home,
  Bell,
  User,
  Stethoscope,
  ClipboardList,
  UserCheck,
  BarChart3,
  Activity,
  Upload,
  X,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  userType: 'patient' | 'doctor' | 'staff'
}

interface MobileSidebarProps {
  userType: 'patient' | 'doctor' | 'staff'
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ userType, isOpen, onClose }: MobileSidebarProps) {
  const [user, setUser] = useState<User | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<any>(null)
  const [patientProfile, setPatientProfile] = useState<any>(null)
  const [staffProfile, setStaffProfile] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        
        if (parsedUser.userType === 'doctor') {
          fetchDoctorProfile(parsedUser.id)
        } else if (parsedUser.userType === 'patient') {
          fetchPatientProfile(parsedUser.id)
        } else if (parsedUser.userType === 'staff') {
          fetchStaffProfile(parsedUser.id)
        }
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
  }, [])

  const fetchDoctorProfile = async (doctorId: string) => {
    const profile = await doctorService.getProfile(doctorId)
    if (profile) {
      setDoctorProfile(profile)
    }
  }

  const fetchPatientProfile = async (patientId: string) => {
    const profile = await patientService.getProfile(patientId)
    if (profile) {
      setPatientProfile(profile)
    }
  }
// Staff Profile
  const fetchStaffProfile = async (staffId: string) => { 
    const profile = await staffService.getProfile(staffId)
    if (profile) {
      setStaffProfile(profile)
    } else {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setStaffProfile({ name: user.name, email: user.email })
      }
    }
  }

  const getMenuItems = () => {
    switch (userType) {
      case "patient":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, path: "/patient/dashboard" },
          { id: "profile", label: "Profile", icon: User, path: "/patient/profile" },
          { id: "appointments", label: "Appointments", icon: Calendar, path: "/patient/appointments" },
          { id: "queue", label: "Queue Status", icon: Users, path: "/patient/queue" },
          { id: "notifications", label: "Notifications", icon: Bell, path: "/patient/notifications" },
          { id: "lab-results", label: "Lab Results", icon: FileText, path: "/patient/lab-results" },
          { id: "medical-records", label: "Medical History", icon: Activity, path: "/patient/medical-history" },
          { id: "medications", label: "Medications", icon: Pill, path: "/patient/medications" },
          { id: "wellness", label: "Wellness Tips", icon: Heart, path: "/patient/wellness" },
        ]
      case "doctor":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, path: "/doctor/dashboard" },
          { id: "patients", label: "Patients", icon: User, path: "/doctor/patients" },
          { id: "queue", label: "Queue", icon: Users, path: "/doctor/queue" },
          { id: "appointments", label: "Appointments", icon: Calendar, path: "/doctor/appointments" },
          { id: "notifications", label: "Notifications", icon: Bell, path: "/doctor/notifications" },
          { id: "lab-results", label: "Upload Lab Results", icon: Upload, path: "/doctor/lab-results" },
          { id: "records", label: "Medical Records", icon: FileText, path: "/doctor/records" },
          { id: "prescriptions", label: "Prescriptions", icon: Pill, path: "/doctor/prescriptions" },
        ]
      case "staff":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, path: "/staff/dashboard" },
          { id: "appointments", label: "Appointments", icon: Calendar, path: "/staff/appointments" },
          { id: "reschedule", label: "Reschedule", icon: ClipboardList, path: "/staff/appointments/reschedule" },
          { id: "queue", label: "Queue Management", icon: Users, path: "/staff/queue" },
          { id: "notifications", label: "Notifications", icon: Bell, path: "/staff/notifications" },
          { id: "messages", label: "Patient Messages", icon: MessageCircle, path: "/staff/messages" },
          { id: "analytics", label: "Analytics", icon: BarChart3, path: "/staff/analytics" },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
    onClose()
  }

  const getUserInfo = () => {
    switch (userType) {
      case "patient":
        const patientName = patientProfile?.name || user?.name || 'Loading...'
        if (patientName === 'Loading...') {
          return { name: patientName, icon: User }
        }
        return { name: formatPatientName(patientName), icon: User }
      case "doctor":
        const doctorName = doctorProfile?.name || user?.name || 'Loading...'
        if (doctorName === 'Loading...') {
          return { name: doctorName, icon: Stethoscope }
        }
        return { name: formatDoctorName(doctorName), icon: Stethoscope }
      case "staff":
        const staffName = staffProfile?.name || user?.name || 'Loading...'
        if (staffName === 'Loading...') {
          return { name: staffName, icon: ClipboardList }
        }
        return { name: formatPatientName(staffName), icon: ClipboardList }
      default:
        return { name: user?.name || 'Loading...', icon: User }
    }
  }

  const userInfo = getUserInfo()
  const UserIcon = userInfo.icon

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 w-64 h-full bg-white dark:bg-gray-800 z-50 flex flex-col md:hidden">
        {/* Header with Close Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 rounded-full p-2">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {userInfo.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{userType}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={onClose}
                className={`w-full flex items-center justify-start px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* AI Assistant Card */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm text-gray-900 dark:text-white">AI Assistant</span>
            </div>
            <Link 
              href={`/${userType}/chatbot`}
              onClick={onClose}
              className="w-full text-white py-2 px-3 rounded text-sm flex items-center justify-center space-x-2"
              style={{ background: 'linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)' }}
            >
              <MessageCircle className="h-3 w-3" />
              <span>Start Chat</span>
            </Link>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button className="w-full flex items-center justify-start px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-start px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}