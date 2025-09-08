"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { useToast } from "@/app/components/ui/toast"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { showToast, ToastComponent } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      showToast("Reset token is missing. Please start the process again.", "error")
      router.push('/forgot-password')
      return
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match. Please try again.", "error")
      return
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long.", "error")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Your password has been reset. You can now login with your new password.", "success")
        router.push('/login')
      } else {
        showToast(data.message || "Failed to reset password. Please try again.", "error")
      }
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link 
              href="/forgot-password"
              className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Illustration */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-md">
                  <Image
                    src="/resetpassword.png"
                    alt="Reset password illustration"
                    width={400}
                    height={400}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="w-full max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-4">
                    Reset Password
                  </h1>
                  <p className="text-gray-600 mb-8 text-sm sm:text-base">
                    Please create a new password for your account.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 transition-all"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 transition-all"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="text-xs text-gray-600">
                      Password strength: {password.length >= 8 ? "Strong" : password.length >= 6 ? "Medium" : "Weak"}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                    className="w-full py-3 text-white font-medium rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
                    }}
                  >
                    {isLoading ? "Resetting Password..." : "Reset Password"}
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
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
      {ToastComponent}
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}