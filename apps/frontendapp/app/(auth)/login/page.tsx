"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaArrowLeft } from "react-icons/fa";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5002/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("Login response:", data); // Debug log

      if (response.ok) {
        // Store token
        localStorage.setItem("token", data.accessToken);

        // Decode user info from JWT token
        const tokenPayload = JSON.parse(atob(data.accessToken.split(".")[1]));
        const user = {
          id: data.userId,
          name: tokenPayload.email.split("@")[0], // Use email prefix as name for now
          email: tokenPayload.email,
          userType: tokenPayload.userType,
        };

        localStorage.setItem("user", JSON.stringify(user));

        console.log("Stored user:", user); // Debug log
        console.log("Redirecting to dashboard..."); // Debug log

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google login - Coming soon");
  };

  const handleGithubLogin = () => {
    // TODO: Implement GitHub OAuth
    console.log("GitHub login - Coming soon");
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
            <h2 className="mb-2 text-2xl font-bold text-blue-500">Login</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back to Health bridge
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter Your Email"
                className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter Password"
                className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border-0 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>

            {/* Login Button */}
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
                  Logging in...
                </>
              ) : (
                "Login"
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

          {/* Social Login */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FcGoogle className="mr-3" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Login with Google
              </span>
            </button>

            <button
              onClick={handleGithubLogin}
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <FaGithub className="mr-3" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                Login with Github
              </span>
            </button>
          </div>

          {/* Signup Link */}
          <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Signup →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
