'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/app/components/layout/sidebar'
import { MobileSidebar } from '@/app/components/layout/mobile-sidebar'
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <Sidebar userType={user.userType} />
        
        {/* Mobile Sidebar */}
        <MobileSidebar 
          userType={user.userType} 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 ml-16 md:ml-0">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
                >
                  <Menu className="h-4 w-4" />
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
              
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <div className="hidden sm:block">
                  <NotificationBell userType="staff" userId={user.id} />
                </div>
                <ModeToggle />
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 p-3 sm:p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}