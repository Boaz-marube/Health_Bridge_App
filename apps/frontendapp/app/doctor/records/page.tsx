'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, Search, Calendar, User, Download } from 'lucide-react'
import { doctorService } from '@/app/services/doctor.service'

interface HealthRecord {
  _id: string
  patientId: {
    _id: string
    name: string
    email: string
  }
  recordType: 'prescription' | 'lab_result' | 'diagnosis' | 'consultation_note'
  title: string
  description: string
  fileUrl?: string
  createdAt: string
  updatedAt: string
}

export default function RecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    const data = await doctorService.getHealthRecords()
    setRecords(data)
    setLoading(false)
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || record.recordType === selectedType
    return matchesSearch && matchesType
  })

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'prescription': return 'bg-blue-100 text-blue-800'
      case 'lab_result': return 'bg-green-100 text-green-800'
      case 'diagnosis': return 'bg-red-100 text-red-800'
      case 'consultation_note': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'prescription': return '💊'
      case 'lab_result': return '🧪'
      case 'diagnosis': return '🩺'
      case 'consultation_note': return '📝'
      default: return '📄'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading records...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Medical Records</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage patient medical records and documents</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload Record</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search records or patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="prescription">Prescriptions</option>
          <option value="lab_result">Lab Results</option>
          <option value="diagnosis">Diagnoses</option>
          <option value="consultation_note">Consultation Notes</option>
        </select>
      </div>

      {/* Records List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredRecords.map((record) => (
            <div key={record._id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center text-lg sm:text-2xl">
                      {getRecordTypeIcon(record.recordType)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                        {record.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${getRecordTypeColor(record.recordType)}`}>
                        {record.recordType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="truncate">{record.patientId?.name || 'Unknown Patient'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {new Date(record.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2">
                      {record.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:items-center sm:space-x-2">
                  {record.fileUrl && (
                    <button className="bg-gray-500 hover:bg-gray-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  )}
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">
                    View
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No records found</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            {searchTerm || selectedType !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'No medical records available yet'}
          </p>
        </div>
      )}
    </div>
  )
}