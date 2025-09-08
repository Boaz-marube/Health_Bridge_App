"use client"

import React, { useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/verify-code?email=${encodeURIComponent(email)}`)
      } else {
        setError(data.message || "Failed to send verification code. Please try again.")
      }
    } catch (error) {
      setError("Failed to send verification code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link 
            href="/login"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Illustration */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-1">
              <div className="relative w-full max-w-sm sm:max-w-md">
                <Image
                  src="/forgotpassword.png"
                  alt="Forgot password illustration"
                  width={400}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0 order-1 lg:order-2">
              <div className="text-center lg:text-left mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-500 mb-4">
                  Forgot Password
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                  Please enter the email address you'd like your password verification number to be sent to.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 mb-6 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 font-medium text-white transition-all duration-200 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{
                    background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
                  }}
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending Code...
                    </>
                  ) : (
                    "Send Code"
                  )}
                </button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors"
                  >
                    Back to Login
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}