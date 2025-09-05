"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/app/components/layout/sidebar"
import { FileText, Download, Eye, AlertCircle, Calendar, User, Pill, TestTube } from "lucide-react"

const mockVisits = [
  {
    id: 1,
    date: "2024-12-20",
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    diagnosis: "Routine Checkup",
    notes: "Patient in good health. Continue current medications.",
    status: "completed",
  },
  {
    id: 2,
    date: "2024-11-15",
    doctor: "Dr. Michael Chen",
    specialty: "General Medicine",
    diagnosis: "Mild Hypertension",
    notes: "Blood pressure slightly elevated. Prescribed medication and lifestyle changes.",
    status: "completed",
  },
]

const mockPrescriptions = [
  {
    id: 1,
    date: "2024-12-20",
    doctor: "Dr. Sarah Johnson",
    medication: "Lisinopril",
    dosage: "10mg daily",
    duration: "30 days",
    instructions: "Take with food in the morning",
    status: "active",
  },
  {
    id: 2,
    date: "2024-12-20",
    doctor: "Dr. Sarah Johnson",
    medication: "Vitamin D",
    dosage: "1000 IU daily",
    duration: "90 days",
    instructions: "Take with meals",
    status: "active",
  },
]

const mockLabResults = [
  {
    id: 1,
    date: "2024-12-18",
    doctor: "Dr. Sarah Johnson",
    testName: "Complete Blood Count",
    status: "normal",
    fileType: "PDF",
    fileSize: "245 KB",
    available: true,
  },
  {
    id: 2,
    date: "2024-11-10",
    doctor: "Dr. Michael Chen",
    testName: "Lipid Panel",
    status: "abnormal",
    fileType: "PDF",
    fileSize: "189 KB",
    available: false,
  },
]

export default function MedicalRecordsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("visits")
  const [loadingFile, setLoadingFile] = useState<number | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  const handleFileView = async (recordId: number) => {
    setLoadingFile(recordId)
    setFileError(null)

    // Simulate file loading
    setTimeout(() => {
      setLoadingFile(null)
      // Simulate file load failure for demo
      if (recordId === 2) {
        setFileError("Couldn't open file. Try again later.")
      } else {
        // Open file viewer (would be actual implementation)
        alert("Opening file viewer...")
      }
    }, 1500)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar userType={user.userType} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medical Records</h1>
            <p className="text-gray-600 dark:text-gray-400">Access your complete medical history</p>
          </div>

          {/* Error Display */}
          {fileError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200">{fileError}</span>
            </div>
          )}

          {/* Records Tabs */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("visits")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === "visits"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Visits</span>
                </button>
                <button
                  onClick={() => setActiveTab("prescriptions")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === "prescriptions"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Pill className="h-4 w-4" />
                  <span>Prescriptions</span>
                </button>
                <button
                  onClick={() => setActiveTab("lab-results")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === "lab-results"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <TestTube className="h-4 w-4" />
                  <span>Lab Results</span>
                </button>
              </nav>
            </div>

            {/* Visits Tab */}
            {activeTab === "visits" && (
              <div className="space-y-4">
                {mockVisits.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">No visit records available</h3>
                    <p className="text-gray-600 dark:text-gray-400">Your visit history will appear here after appointments</p>
                  </div>
                ) : (
                  mockVisits.map((visit) => (
                    <div key={visit.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{visit.diagnosis}</h3>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                                {visit.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{visit.date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{visit.doctor} - {visit.specialty}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Doctor's Notes</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{visit.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === "prescriptions" && (
              <div className="space-y-4">
                {mockPrescriptions.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <Pill className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">No prescriptions available</h3>
                    <p className="text-gray-600 dark:text-gray-400">Your prescriptions will appear here after doctor visits</p>
                  </div>
                ) : (
                  mockPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{prescription.medication}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              prescription.status === "active" 
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            }`}>
                              {prescription.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p><strong>Dosage:</strong> {prescription.dosage}</p>
                            <p><strong>Duration:</strong> {prescription.duration}</p>
                            <p><strong>Instructions:</strong> {prescription.instructions}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{prescription.date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{prescription.doctor}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Lab Results Tab */}
            {activeTab === "lab-results" && (
              <div className="space-y-4">
                {mockLabResults.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <TestTube className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">No lab results available</h3>
                    <p className="text-gray-600 dark:text-gray-400">Your lab results will appear here when available</p>
                  </div>
                ) : (
                  mockLabResults.map((result) => (
                    <div key={result.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{result.testName}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              result.status === "normal" 
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                            }`}>
                              {result.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{result.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{result.doctor}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{result.fileType} • {result.fileSize}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-x-2">
                          <button
                            disabled={!result.available || loadingFile === result.id}
                            onClick={() => handleFileView(result.id)}
                            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 inline-flex"
                          >
                            {loadingFile === result.id ? (
                              <span>Loading...</span>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </>
                            )}
                          </button>
                          <button 
                            disabled={!result.available}
                            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 inline-flex ml-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}