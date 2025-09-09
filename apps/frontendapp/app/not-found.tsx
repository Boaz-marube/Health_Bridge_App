'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Log 404 attempt for debugging (non-error level)
    console.log('404 Page accessed for route:', pathname)
    
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        
        if (userData && token) {
          const parsedUser = JSON.parse(userData)
          if (parsedUser && parsedUser.role) {
            setUser(parsedUser)
            setIsAuthenticated(true)
            return
          }
        }
        
        setUser(null)
        setIsAuthenticated(false)
      } catch (error) {
        console.log('Authentication check failed:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname])

  const handleNavigation = () => {
    if (!isAuthenticated || !user) {
      router.push('/')
    } else {
      switch (user.role?.toLowerCase()) {
        case 'patient':
          router.push('/patient')
          break
        case 'doctor':
          router.push('/doctor')
          break
        case 'staff':
          router.push('/staff')
          break
        default:
          router.push('/')
      }
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4 relative">
      {/* Floating background elements - constrained to viewport */}
      <div className="absolute inset-4 pointer-events-none">
        <div className="absolute top-8 left-8 animate-pulse" style={{ animationDuration: '2s' }}>
          <img src="/heart-icon.svg" alt="" className="w-8 h-8 opacity-40" style={{ filter: 'hue-rotate(0deg) saturate(0.8)' }} />
        </div>
        <div className="absolute top-16 right-8 animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
          <img src="/stethoscope-icon.svg" alt="" className="w-7 h-7 opacity-40" style={{ filter: 'hue-rotate(200deg) saturate(0.8)' }} />
        </div>
        <div className="absolute bottom-16 left-8 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }}>
          <img src="/plus-icon.svg" alt="" className="w-6 h-6 opacity-40" style={{ filter: 'hue-rotate(120deg) saturate(0.8)' }} />
        </div>
        <div className="absolute bottom-8 right-8 animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '2s' }}>
          <img src="/activity-icon.svg" alt="" className="w-9 h-9 opacity-40" style={{ filter: 'hue-rotate(280deg) saturate(0.8)' }} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Hero Image */}
        <div className="mb-6 relative">
          <div className="relative w-full max-w-sm mx-auto">
            <img
              src="/404.png"
              alt="404 Error - Health Bridge"
              className="w-full h-auto rounded-2xl shadow-lg"
              style={{ 
                animation: 'gentle-bounce 4s ease-in-out infinite',
                animationFillMode: 'both'
              }}
            />
            <style jsx>{`
              @keyframes gentle-bounce {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
              }
            `}</style>
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-lg font-bold animate-pulse">
            404
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 mb-6">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
            Oops! We've Lost the{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bridge
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed px-4">
            It looks like you've wandered off the health bridge! Don't worry, our medical team is here to guide you back to safety.
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg inline-block mx-4">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
              <img src="/stethoscope-icon.svg" alt="" className="w-5 h-5" style={{ filter: 'hue-rotate(200deg)' }} />
              <span className="font-semibold text-sm">Health Bridge Diagnosis:</span>
            </div>
            <p className="text-gray-700 text-sm">
              <strong>Status:</strong> Page temporarily disconnected
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleNavigation}
            className="min-w-[200px] flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {isAuthenticated && user ? (
              <>
                <ArrowLeft className="mr-2" size={20} />
                Back to Dashboard
              </>
            ) : (
              <>
                <Home className="mr-2" size={20} />
                Return to Health Hub
              </>
            )}
          </button>
          
          <button
            onClick={handleGoBack}
            className="min-w-[200px] flex items-center justify-center space-x-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <ArrowLeft className="mr-2" size={20} />
            Go Back
          </button>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-gray-500">
          <p className="text-xs sm:text-sm px-4">
            Need immediate assistance? Our health bridge team is always here to help you find your way.
          </p>
        </div>
      </div>
    </main>
  )
}