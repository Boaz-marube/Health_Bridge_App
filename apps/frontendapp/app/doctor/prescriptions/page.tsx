'use client'

import { useState, useEffect } from 'react'
import { Pill, Plus, Search, Calendar, User, Clock } from 'lucide-react'
import { doctorService } from '@/app/services/doctor.service'

interface Prescription {
  _id: string
  patientId: {
    _id: string
    name: string
    email: string
  }
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]
  diagnosis: string
  notes?: string
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
  validUntil: string
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    const data = await doctorService.getPrescriptions()
    setPrescriptions(data)
    setLoading(false)
  }

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading prescriptions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage patient prescriptions and medications</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Prescription</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search patient or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
            style={{ minHeight: '40px' }}
          >
            <option value="all" className="py-2 px-3 text-sm sm:text-base">All Status</option>
            <option value="active" className="py-2 px-3 text-sm sm:text-base">Active</option>
            <option value="completed" className="py-2 px-3 text-sm sm:text-base">Completed</option>
            <option value="cancelled" className="py-2 px-3 text-sm sm:text-base">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredPrescriptions.map((prescription) => (
          <div key={prescription._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="bg-blue-500 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                    {prescription.patientId?.name || 'Unknown Patient'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {prescription.diagnosis || 'No diagnosis provided'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(prescription.status)}`}>
                {prescription.status}
              </span>
            </div>

            {/* Medications */}
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Medications:</h4>
              {prescription.medications?.map((med, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 space-y-1 sm:space-y-0">
                    <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{med.name}</span>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{med.dosage}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <p>{med.frequency} for {med.duration}</p>
                    {med.instructions && <p className="mt-1 italic line-clamp-2">{med.instructions}</p>}
                  </div>
                </div>
              )) || (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No medications listed</p>
              )}
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">Notes:</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-2 sm:p-3 line-clamp-3">
                  {prescription.notes}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Created: </span>{new Date(prescription.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Valid until: </span>{new Date(prescription.validUntil).toLocaleDateString()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3 sm:mt-4">
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-xs sm:text-sm">
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View</span>
              </button>
              <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded text-xs sm:text-sm">
                Print
              </button>
              {prescription.status === 'active' && (
                <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-xs sm:text-sm">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Pill className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No prescriptions found</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'No prescriptions created yet'}
          </p>
        </div>
      )}
    </div>
  )
}