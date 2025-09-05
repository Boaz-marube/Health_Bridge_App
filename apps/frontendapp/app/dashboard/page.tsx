'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PatientDashboard from './components/PatientDashboard'
import DoctorDashboard from './components/DoctorDashboard'
import StaffDashboard from './components/StaffDashboard'

interface User {
  id: string
  name: string
  email: string
  userType: 'patient' | 'doctor' | 'staff'
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    console.log('Dashboard - Token:', token); // Debug log
    console.log('Dashboard - User data:', userData); // Debug log
    
    if (!token || !userData) {
      console.log('No token or user data, redirecting to login'); // Debug log
      router.push('/login')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      console.log('Dashboard - Parsed user:', parsedUser); // Debug log
      setUser(parsedUser)
    } catch (error) {
      console.log('Error parsing user data:', error); // Debug log
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Role-based dashboard routing
  switch (user.userType) {
    case 'patient':
      return <PatientDashboard user={user} />
    case 'doctor':
      return <DoctorDashboard user={user} />
    case 'staff':
      return <StaffDashboard user={user} />
    default:
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Invalid User Type
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please contact support for assistance.
          </p>
        </div>
      )
  }
}