"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { useToast } from "@/app/components/ui/toast"
import { ModeToggle } from "@/app/components/theme/mode-toggle"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function VerifyCodePage() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { showToast, ToastComponent } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const verificationCode = code.join("")
    
    if (verificationCode.length !== 6) {
      showToast("Please enter the complete 6-digit verification code.", "error")
      return
    }

    if (!email) {
      showToast("Email not found. Please start the process again.", "error")
      router.push('/forgot-password')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Code verified! Redirecting to reset password...", "success")
        router.push(`/reset-password?token=${data.token}`)
      } else {
        showToast(data.message || "Invalid or expired verification code.", "error")
      }
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      showToast("Email not found. Please start the process again.", "error")
      router.push('/forgot-password')
      return
    }

    setIsResending(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        showToast("A new verification code has been sent to your email.", "success")
        // Reset code inputs
        setCode(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      } else {
        const data = await response.json()
        showToast(data.message || "Could not resend verification code.", "error")
      }
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link 
            href="/forgot-password"
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <Image
                  src="/forgotpassword.png"
                  alt="Verification code illustration"
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
                  Enter Your Verification Code
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
                  Please check your inbox to find the 6-digit code we sent to{" "}
                  <span className="font-medium text-gray-800 dark:text-gray-200">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                {/* Verification Code Inputs */}
                <div className="flex justify-center lg:justify-start gap-2 sm:gap-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg font-semibold bg-blue-50 dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {/* Resend Code Link */}
                <div className="text-center lg:text-left">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Didn't get it?{" "}
                    <span className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                      {isResending ? "Sending..." : "Resend code"}
                    </span>
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || code.join("").length !== 6}
                  className="w-full py-3 text-white font-medium rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)",
                  }}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
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
      {ToastComponent}
    </div>
  )
}