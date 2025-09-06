'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  // Role-based dashboard routing
  useEffect(() => {
    if (user && !loading) {
      switch (user.userType) {
        case 'patient':
          router.replace('/patient/dashboard')
          break
        case 'doctor':
          router.replace('/doctor/dashboard')
          break
        case 'staff':
          router.replace('/staff/dashboard')
          break
      }
    }
  }, [user, router, loading])

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

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-lg text-gray-600 dark:text-gray-400">Redirecting...</div>
    </div>
  )
}