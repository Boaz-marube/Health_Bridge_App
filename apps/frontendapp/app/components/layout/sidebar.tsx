"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
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
} from "lucide-react"

interface SidebarProps {
  userType: 'patient' | 'doctor' | 'staff'
}

export function Sidebar({ userType }: SidebarProps) {
  const [activeSection, setActiveSection] = useState("dashboard")
  const router = useRouter()
  const pathname = usePathname()

  const getMenuItems = () => {
    switch (userType) {
      case "patient":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
          { id: "appointments", label: "Appointments", icon: Calendar, path: "/appointments" },
          { id: "queue", label: "Queue Status", icon: Users, path: "/queue" },
          { id: "medical-records", label: "Medical Records", icon: FileText, path: "/health-records" },
          { id: "medications", label: "Medications", icon: Pill, path: "/medications" },
          { id: "wellness", label: "Wellness Tips", icon: Heart, path: "/wellness" },
        ]
      case "doctor":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
          { id: "patients", label: "Patients", icon: User, path: "/patients" },
          { id: "queue", label: "Queue", icon: Users, path: "/queue" },
          { id: "appointments", label: "Appointments", icon: Calendar, path: "/appointments" },
          { id: "records", label: "Medical Records", icon: FileText, path: "/records" },
          { id: "prescriptions", label: "Prescriptions", icon: Pill, path: "/prescriptions" },
        ]
      case "staff":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
          { id: "queue-management", label: "Queue Management", icon: Users, path: "/admin/queue" },
          { id: "appointments", label: "Appointments", icon: Calendar, path: "/admin/appointments" },
          { id: "patients", label: "Patient Check-in", icon: UserCheck, path: "/admin/patients" },
          { id: "notifications", label: "Notifications", icon: Bell, path: "/admin/notifications" },
          { id: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  const handleNavigation = (item: any) => {
    if (item.path) {
      router.push(item.path)
    }
    setActiveSection(item.id)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const getUserInfo = () => {
    switch (userType) {
      case "patient":
        return { name: "John Smith", icon: User }
      case "doctor":
        return { name: "Dr. Sarah Wilson", icon: Stethoscope }
      case "staff":
        return { name: "Admin Staff", icon: ClipboardList }
      default:
        return { name: "User", icon: User }
    }
  }

  const userInfo = getUserInfo()
  const UserIcon = userInfo.icon

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
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
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path || activeSection === item.id
          return (
            <button
              key={item.id}
              className={`w-full flex items-center justify-start px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleNavigation(item)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* AI Assistant Card */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-sm text-gray-900 dark:text-white">AI Assistant</span>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
              Online
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Ask me about appointments, medications, or health questions.
          </p>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm flex items-center justify-center space-x-2">
            <MessageCircle className="h-3 w-3" />
            <span>Start Chat</span>
          </button>
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
  )
}