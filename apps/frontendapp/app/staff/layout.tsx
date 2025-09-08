'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/app/components/layout/sidebar'
import { ModeToggle } from '@/app/components/theme/mode-toggle'
import { ErrorBoundary } from '@/app/components/ui/error-boundary'
import { staffService, StaffProfile } from '@/app/services/staff.service'
import { formatPatientName } from '@/app/lib/name-utils'
import { NotificationBell } from '@/app/components/notifications/NotificationBell'
import { Menu } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  userType: 'patient' | 'doctor' | 'staff'
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.replace('/login')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.userType !== 'staff') {
        router.replace('/dashboard')
        return
      }
      setUser(parsedUser)
      fetchStaffProfile(parsedUser)
    } catch (error) {
      router.replace('/login')
    }
  }, [router])

  const fetchStaffProfile = async (userData: User) => {
    const profile = await staffService.getProfile(userData.id)
    if (profile) {
      setStaffProfile(profile)
    } else {
      setStaffProfile({
        _id: userData.id,
        name: userData.name,
        email: userData.email
      })
    }
    setLoading(false)
  }

  const getDisplayName = () => {
    if (staffProfile) {
      return formatPatientName(staffProfile.name)
    }
    return formatPatientName(user?.name || 'Staff')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar userType={user.userType} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Header */}
        <header className="fixed top-0 right-0 left-16 md:left-64 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Staff Portal
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {getDisplayName()}
                </p>
                {staffProfile?.department && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {staffProfile.department}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationBell userType="staff" userId={user.id} />
              <ModeToggle />
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="ml-16 md:ml-64 pt-16 p-4 sm:p-6 ">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  )
}