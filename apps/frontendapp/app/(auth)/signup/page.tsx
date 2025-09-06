"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    userType: "patient",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const endpoint =
        formData.userType === "doctor"
          ? "http://localhost:5002/auth/doctor-signup"
          : "http://localhost:5002/auth/patient-signup";

      const requestBody = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        ...(formData.userType === "doctor" && {
          specialization: "General Practice", // Default value
          licenseNumber: "TBD", // To be updated later
        }),
      };

      console.log("Signup endpoint:", endpoint); // Debug log
      console.log("Signup request body:", requestBody); // Debug log

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Signup response status:", response.status); // Debug log
      console.log(
        "Signup response headers:",
        response.headers.get("content-type")
      ); // Debug log

      const responseText = await response.text();
      console.log("Signup raw response:", responseText); // Debug log

      if (response.ok) {
        // Success! Handle empty response or JSON
        let data = {};
        if (responseText.trim()) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.log("Response not JSON, but signup successful");
          }
        }

        console.log("Signup successful!"); // Debug log
        // Redirect to login with success message
        router.push(
          "/login?message=Account created successfully! Please login."
        );
      } else {
        // Handle error response
        let errorMessage = "Signup failed. Please try again.";
        if (responseText.trim()) {
          try {
            const data = JSON.parse(responseText);
            errorMessage = data.message || errorMessage;
          } catch (parseError) {
            errorMessage = responseText || errorMessage;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.log("Signup error:", error); // Debug log
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup - Coming soon");
  };

  const handleGithubSignup = () => {
    console.log("GitHub signup - Coming soon");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-white shadow-sm dark:bg-gray-800">
        <Link href="/" className="mr-4 text-blue-500">
          <FaArrowLeft size={20} />
        </Link>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full dark:bg-blue-900">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Health
            </h1>
            <h1 className="-mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              Bridge
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-blue-500">Sign Up</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome to Health Bridge
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Type <span className="text-red-500">*</span>
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-gray-700 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter Your Full Name"
                className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your Email Address"
                className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your Phone number"
                className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-gray-700 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your Address"
                className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a Strong Password"
                className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your Password"
                className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full py-3 font-medium text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
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
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400">
              OR
            </span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Social Sign Up */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FcGoogle className="mr-3" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Sign up with Google
              </span>
            </button>

            <button
              onClick={handleGithubSignup}
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FaGithub className="mr-3" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Sign up with Github
              </span>
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
