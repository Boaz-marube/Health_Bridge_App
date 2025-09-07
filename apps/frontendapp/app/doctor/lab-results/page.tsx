'use client'

import { useState, useCallback, useEffect } from 'react'
import { Upload, FileText, User, Search } from 'lucide-react'
import { doctorService } from '@/app/services/doctor.service'
import { notificationService } from '@/app/services/notification.service'
import { formatName } from '@/app/lib/name-utils'
import { useToast } from '@/app/components/ui/toast'

interface Patient {
  _id: string
  name: string
  email: string
  phoneNumber?: string
}

export default function LabResultsPage() {
  const { showToast, ToastComponent } = useToast()
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  
  const [testType, setTestType] = useState('')
  const [testDate, setTestDate] = useState('')
  const [resultFormat, setResultFormat] = useState<'upload' | 'text'>('upload')
  const [resultText, setResultText] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const data = await doctorService.getPatients()
      setPatients(data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const filteredPatients = patients.filter(patient =>
    formatName(patient.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFileUpload = useCallback((file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      showToast('Please upload a PDF, JPG, PNG, or DOC file.', 'error')
      return
    }

    if (file.size > maxSize) {
      showToast('File size must be less than 10MB.', 'error')
      return
    }

    setUploadedFile(file)
  }, [showToast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient || !testType || !testDate) {
      showToast('Please fill in all required fields.', 'error')
      return
    }

    if (resultFormat === 'upload' && !uploadedFile) {
      showToast('Please upload a file or switch to text entry.', 'error')
      return
    }

    if (resultFormat === 'text' && !resultText.trim()) {
      showToast('Please enter the lab results or switch to file upload.', 'error')
      return
    }

    setLoading(true)
    try {
      const userData = localStorage.getItem('user')
      if (!userData) throw new Error('User not found')
      
      const user = JSON.parse(userData)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('patientId', selectedPatient._id)
      formData.append('doctorId', user.id)
      formData.append('testType', testType)
      formData.append('testDate', testDate)
      formData.append('resultFormat', resultFormat)
      formData.append('status', 'completed')
      
      if (resultFormat === 'text') {
        formData.append('resultText', resultText)
      }
      
      if (additionalNotes) {
        formData.append('additionalNotes', additionalNotes)
      }
      
      if (uploadedFile) {
        formData.append('file', uploadedFile)
      }

      // Upload lab result to database
      await doctorService.uploadLabResultWithFile(formData)
      
      // Send notification to patient
      await notificationService.sendNotification({
        recipientId: selectedPatient._id,
        recipientType: 'patient',
        type: 'system_alert',
        title: 'New Lab Results Available',
        message: `Your ${testType.replace('-', ' ')} results from ${testDate} are now available. Please check your medical history to view the details.`,
        priority: 'high'
      })

      showToast('Lab results uploaded successfully! The patient has been notified.', 'success')
      
      // Reset form
      setSelectedPatient(null)
      setTestType('')
      setTestDate('')
      setResultText('')
      setAdditionalNotes('')
      setUploadedFile(null)
      setResultFormat('upload')
    } catch (error) {
      console.error('Error uploading lab results:', error)
      showToast('Failed to upload lab results. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Lab Results</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload lab results for your patients
          </p>
        </div>

      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Patient *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left flex items-center justify-between"
                >
                  <span>
                    {selectedPatient ? formatName(selectedPatient.name) : 'Choose patient...'}
                  </span>
                  <User className="h-4 w-4 text-gray-400" />
                </button>
                
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient._id}
                          type="button"
                          onClick={() => {
                            setSelectedPatient(patient)
                            setShowDropdown(false)
                            setSearchTerm('')
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {formatName(patient.name)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {patient.email}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Type and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Test Type *
                </label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select test type</option>
                  <option value="blood-test">Blood Test</option>
                  <option value="urine-test">Urine Test</option>
                  <option value="x-ray">X-Ray</option>
                  <option value="mri">MRI Scan</option>
                  <option value="ct-scan">CT Scan</option>
                  <option value="ecg">ECG</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Test Date *
                </label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Result Format Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Result Format *
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setResultFormat('upload')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded border ${
                    resultFormat === 'upload'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultFormat('text')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded border ${
                    resultFormat === 'text'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Enter Text</span>
                </button>
              </div>
            </div>

            {/* File Upload */}
            {resultFormat === 'upload' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Results File
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 text-blue-500 mx-auto" />
                      <p className="font-medium text-gray-900 dark:text-white">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">PDF, JPG, PNG, DOC up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileSelect}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Choose File
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text Entry */}
            {resultFormat === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enter Results *
                </label>
                <textarea
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={6}
                  placeholder="Enter the lab results here..."
                  required={resultFormat === 'text'}
                />
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Notes
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Any additional notes or observations..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded font-medium"
            >
              {loading ? 'Uploading...' : 'Upload Lab Results'}
            </button>

            {/* Footer Note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                The patient will be automatically notified when this lab result is uploaded and can view it in their dashboard.
              </p>
            </div>
          </form>
        </div>
      </div>
      {ToastComponent}
    </div>
  )
}