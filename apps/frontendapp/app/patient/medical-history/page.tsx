'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, User, Pill, TestTube } from 'lucide-react'
import { patientService } from '@/app/services/patient.service'

interface MedicalRecord {
  _id: string
  recordType: 'prescription' | 'lab_result' | 'diagnosis' | 'consultation_note'
  title: string
  description: string
  doctorName?: string
  fileUrl?: string
  createdAt: string
  updatedAt: string
}

export default function MedicalHistoryPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'prescriptions' | 'lab_results' | 'consultations'>('all')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchMedicalData(parsedUser.id)
    }
  }, [])

  const fetchMedicalData = async (patientId: string) => {
    const [medicalHistory, patientPrescriptions] = await Promise.all([
      patientService.getMedicalHistory(patientId),
      patientService.getPrescriptions(patientId)
    ])
    setRecords(medicalHistory)
    setPrescriptions(patientPrescriptions)
    setLoading(false)
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'prescription': return <Pill className="h-5 w-5 text-blue-500" />
      case 'lab_result': return <TestTube className="h-5 w-5 text-green-500" />
      case 'diagnosis': return <FileText className="h-5 w-5 text-red-500" />
      case 'consultation_note': return <User className="h-5 w-5 text-purple-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'prescription': return 'bg-blue-100 text-blue-800'
      case 'lab_result': return 'bg-green-100 text-green-800'
      case 'diagnosis': return 'bg-red-100 text-red-800'
      case 'consultation_note': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRecords = records.filter(record => {
    if (activeTab === 'all') return true
    if (activeTab === 'prescriptions') return record.recordType === 'prescription'
    if (activeTab === 'lab_results') return record.recordType === 'lab_result'
    if (activeTab === 'consultations') return record.recordType === 'consultation_note'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading medical history...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical History</h1>
        <p className="text-gray-600 dark:text-gray-400">View your medical records, prescriptions, and lab results</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', label: 'All Records', count: records.length },
            { id: 'prescriptions', label: 'Prescriptions', count: records.filter(r => r.recordType === 'prescription').length },
            { id: 'lab_results', label: 'Lab Results', count: records.filter(r => r.recordType === 'lab_result').length },
            { id: 'consultations', label: 'Consultations', count: records.filter(r => r.recordType === 'consultation_note').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">No records found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'all' 
                ? 'No medical records available yet' 
                : `No ${activeTab.replace('_', ' ')} found`}
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getRecordIcon(record.recordType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {record.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecordTypeColor(record.recordType)}`}>
                        {record.recordType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {record.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      {record.doctorName && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{record.doctorName}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {record.fileUrl && (
                    <button className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                  )}
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prescriptions Section */}
      {prescriptions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Pill className="h-5 w-5" />
            <span>Active Prescriptions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.slice(0, 4).map((prescription, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {prescription.medicationName || `Medication ${index + 1}`}
                  </h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Dosage: {prescription.dosage || '10mg daily'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Duration: {prescription.duration || '30 days'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}