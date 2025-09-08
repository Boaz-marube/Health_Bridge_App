'use client'

import { useState, useEffect } from 'react'
import { FileText, Calendar, User, Eye, Download } from 'lucide-react'
import { patientService } from '@/app/services/patient.service'
import { formatName } from '@/app/lib/name-utils'
import { useToast } from '@/app/components/ui/toast'

interface LabResult {
  _id: string
  testName: string
  testDate: string
  results: string
  notes?: string
  referenceRange?: string
  units?: string
  status: string
  doctorId: {
    name: string
    specialization?: string
  }
  createdAt?: string
}

export default function PatientLabResultsPage() {
  const [labResults, setLabResults] = useState<LabResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    fetchLabResults()
  }, [])

  const fetchLabResults = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        const data = await patientService.getLabResults(user.id)
        setLabResults(data)
      }
    } catch (error) {
      console.error('Error fetching lab results:', error)
      showToast('Failed to load lab results', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatTestType = (testType: string) => {
    if (!testType) return 'Unknown Test'
    return testType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const viewResult = (result: LabResult) => {
    setSelectedResult(result)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading lab results...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Lab Results</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">View your medical test results and reports</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Lab Results ({labResults.length})
          </h2>
          
          {labResults.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No lab results available</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {labResults.map((result) => (
                <div
                  key={result._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                        <FileText className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {formatTestType(result.testName)}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>{new Date(result.testDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Dr. {formatName(result.doctorId.name)}</span>
                          </div>
                        </div>
                        {result.notes && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {result.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)} text-center`}>
                        {result.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => viewResult(result)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:py-1 rounded text-xs sm:text-sm flex items-center justify-center space-x-1 w-full sm:w-auto"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Result Detail Modal */}
      {showModal && selectedResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white pr-4">
                  {formatTestType(selectedResult.testName)} Results
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Test Date:</span>
                    <p className="text-gray-900 dark:text-white text-sm">{new Date(selectedResult.testDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Doctor:</span>
                    <p className="text-gray-900 dark:text-white text-sm truncate">Dr. {formatName(selectedResult.doctorId.name)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedResult.status)} inline-block mt-1`}>
                      {selectedResult.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Reference Range:</span>
                    <p className="text-gray-900 dark:text-white text-sm break-words">{selectedResult.referenceRange || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Results:</span>
                  <div className="mt-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm break-words">{selectedResult.results}</p>
                    {selectedResult.units && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Units: {selectedResult.units}</p>
                    )}
                  </div>
                </div>

                {selectedResult.notes && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Additional Notes:</span>
                    <div className="mt-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-900 dark:text-white text-sm break-words">{selectedResult.notes}</p>
                    </div>
                  </div>
                )}

                {selectedResult.createdAt && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    Created on {new Date(selectedResult.createdAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-4 sm:mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {ToastComponent}
    </div>
  )
}