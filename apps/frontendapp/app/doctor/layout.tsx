'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/app/components/layout/sidebar'
import { ModeToggle } from '@/app/components/theme/mode-toggle'
import { ErrorBoundary } from '@/app/components/ui/error-boundary'
import { doctorService, DoctorProfile } from '@/app/services/doctor.service'

interface User {
  id: string
  name: string
  email: string
  userType: 'patient' | 'doctor' | 'staff'
}

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.userType !== 'doctor') {
        router.push('/dashboard')
        return
      }
      setUser(parsedUser)
      fetchDoctorProfile(parsedUser.id)
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  const fetchDoctorProfile = async (doctorId: string) => {
    const profile = await doctorService.getProfile(doctorId)
    if (profile) {
      setDoctorProfile(profile)
    } else {
      setDoctorProfile({
        _id: doctorId,
        name: user?.name || 'Doctor',
        email: user?.email || '',
        specialization: 'General Practice'
      })
    }
    setLoading(false)
  }

  const getDisplayName = () => {
    if (user?.userType === 'doctor' && doctorProfile) {
      const name = doctorProfile.name
      if (name.startsWith('Dr.')) {
        return name
      }
      const firstName = name.split(/[0-9@._-]/)[0]
      const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
      return `Dr. ${capitalizedName}`
    }
    return user?.name || 'User'
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
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
                  Doctor Portal
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {getDisplayName()}
                </p>
                {user?.userType === 'doctor' && doctorProfile?.specialization && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {doctorProfile.specialization}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
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