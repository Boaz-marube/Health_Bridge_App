'use client'

import { useState, useEffect } from 'react'
import { Heart, Activity, Droplets, Moon, Apple, Target } from 'lucide-react'

interface WellnessTip {
  id: string
  category: 'hydration' | 'exercise' | 'sleep' | 'nutrition' | 'mental_health'
  title: string
  description: string
  icon: any
  color: string
}

export default function WellnessPage() {
  const [tips] = useState<WellnessTip[]>([
    {
      id: '1',
      category: 'hydration',
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily. Proper hydration helps your body function optimally and supports recovery.',
      icon: Droplets,
      color: 'text-blue-500'
    },
    {
      id: '2',
      category: 'exercise',
      title: 'Daily Movement',
      description: 'Take a 10-minute walk after meals to aid digestion and improve circulation.',
      icon: Activity,
      color: 'text-green-500'
    },
    {
      id: '3',
      category: 'sleep',
      title: 'Quality Sleep',
      description: 'Get 7-8 hours of quality sleep each night. Good sleep is essential for healing and recovery.',
      icon: Moon,
      color: 'text-purple-500'
    },
    {
      id: '4',
      category: 'nutrition',
      title: 'Balanced Nutrition',
      description: 'Include fruits and vegetables in every meal. They provide essential vitamins and minerals.',
      icon: Apple,
      color: 'text-red-500'
    }
  ])

  const [dailyGoals, setDailyGoals] = useState({
    water: { current: 4, target: 8, unit: 'glasses' },
    steps: { current: 3500, target: 8000, unit: 'steps' },
    sleep: { current: 6.5, target: 8, unit: 'hours' }
  })

  const updateGoal = (goal: string, increment: number) => {
    setDailyGoals(prev => ({
      ...prev,
      [goal]: {
        ...prev[goal as keyof typeof prev],
        current: Math.max(0, prev[goal as keyof typeof prev].current + increment)
      }
    }))
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wellness Tips</h1>
        <p className="text-gray-600 dark:text-gray-400">Daily health tips and wellness tracking</p>
      </div>

      {/* Daily Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Today's Goals</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(dailyGoals).map(([key, goal]) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100)
            return (
              <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">{key}</h4>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.current, goal.target)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateGoal(key, -1)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateGoal(key, 1)}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Wellness Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip) => {
          const IconComponent = tip.icon
          return (
            <div key={tip.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 ${tip.color}`}>
                  <IconComponent className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {tip.description}
                  </p>
                  <div className="mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>
                      {tip.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Health Reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Heart className="h-5 w-5" />
          <span>Health Reminders</span>
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Take your morning medication</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Due in 30 minutes</p>
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
              Mark Done
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Drink a glass of water</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stay hydrated!</p>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}