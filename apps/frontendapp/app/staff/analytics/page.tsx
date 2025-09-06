'use client'

import { useState, useEffect } from 'react'
import { staffService } from '@/app/services/staff.service'
import { BarChart3, TrendingUp, Users, Calendar, Clock, Activity } from 'lucide-react'

interface AnalyticsData {
  appointmentTrends: {
    date: string
    appointments: number
    completed: number
    cancelled: number
  }[]
  queueMetrics: {
    averageWaitTime: number
    totalProcessed: number
    peakHours: string[]
  }
  patientSatisfaction: number
  efficiency: {
    completionRate: number
    onTimeRate: number
    utilizationRate: number
  }
}

export default function StaffAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        const data = await staffService.getAnalytics(user.id)
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">System performance and insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.efficiency.completionRate || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.efficiency.onTimeRate || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Patient Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.patientSatisfaction || 0}/5
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Wait Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.queueMetrics.averageWaitTime || 0}m
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Appointment Trends</span>
          </h2>
          {analytics?.appointmentTrends.length ? (
            <div className="space-y-4">
              {analytics.appointmentTrends.slice(-7).map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(trend.date).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600 dark:text-blue-400">
                      Total: {trend.appointments}
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      Completed: {trend.completed}
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      Cancelled: {trend.cancelled}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No trend data available</p>
            </div>
          )}
        </div>

        {/* Queue Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Queue Performance</span>
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Processed</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics?.queueMetrics.totalProcessed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Wait Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics?.queueMetrics.averageWaitTime || 0} minutes
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Utilization Rate</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics?.efficiency.utilizationRate || 0}%
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Peak Hours</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {analytics?.queueMetrics.peakHours?.map((hour, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                  >
                    {hour}
                  </span>
                )) || (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">No data available</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {analytics?.efficiency.completionRate || 0}%
            </div>
            <p className="text-gray-600 dark:text-gray-400">Appointment Completion Rate</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Excellent performance
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {analytics?.efficiency.onTimeRate || 0}%
            </div>
            <p className="text-gray-600 dark:text-gray-400">On-Time Performance</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Meeting expectations
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {analytics?.patientSatisfaction || 0}/5
            </div>
            <p className="text-gray-600 dark:text-gray-400">Patient Satisfaction</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              High satisfaction
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}