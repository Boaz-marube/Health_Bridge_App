import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Home from '../app/public/health-bridge.svg'
import { ModeToggle } from '@/app/components/theme/mode-toggle'

export const metadata: Metadata = {
  title: 'Health Bridge - Connect with Healthcare Professionals',
  description: 'Your trusted platform for secure medical consultations',
  keywords: 'healthcare, telemedicine, medical consultation, health bridge',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Main Card Container */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center">
          
          {/* Logo/Icon Section */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <Image
                src= {Home}
                alt="Health Bridge Stethoscope"
                width={128}
                height={128}
                className="object-contain"
                priority
              />
            </div>
            
            {/* App Title */}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Health Bridge</h1>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed px-4">
              Connect with healthcare professionals instantly. Your health journey starts here with secure, reliable medical consultations.
            </p>
          </div>

          {/* Action Buttons - Using Next.js Link for routing */}
          <div className="space-y-4">
            {/* Login Button */}
            <Link href="/login" className="block">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300">
                Login
              </button>
            </Link>
            
            {/* Sign Up Button */}
            <Link href="/signup" className="block">
              <button className="w-full bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-500 dark:text-blue-400 font-semibold py-4 px-6 rounded-full border-2 border-blue-500 dark:border-blue-400 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300">
                Sign up
              </button>
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-blue-500 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-blue-500 transition-colors">
                Terms
              </Link>
              <Link href="/help" className="hover:text-blue-500 transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Available 24/7 • Secure & Confidential • Licensed Professionals
          </p>
        </div>
      </div>
    </div>
  )
}