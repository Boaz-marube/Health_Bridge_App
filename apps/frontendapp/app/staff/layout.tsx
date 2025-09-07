'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/app/components/layout/sidebar'
import { ModeToggle } from '@/app/components/theme/mode-toggle'
import { ErrorBoundary } from '@/app/components/ui/error-boundary'
import { staffService, StaffProfile } from '@/app/services/staff.service'
import { formatPatientName } from '@/app/lib/name-utils'
import { NotificationBell } from '@/app/components/notifications/NotificationBell'

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
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
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
              
              <div className="flex items-center space-x-4">
                <NotificationBell userType="staff" userId={user.id} />
                <ModeToggle />
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}