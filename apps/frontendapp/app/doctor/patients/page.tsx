'use client'

import { useState, useEffect } from 'react'
import { Search, User, Calendar, FileText, Phone, Mail } from 'lucide-react'
import { doctorService } from '@/app/services/doctor.service'
import PatientCardSkeleton from '@/app/components/skeletons/PatientCardSkeleton'

interface Patient {
  _id: string
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const patientsPerPage = 8

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    const data = await doctorService.getPatients()
    setPatients(data)
    setLoading(false)
  }

  const filteredPatients = patients
    .filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage)
  const startIndex = (currentPage - 1) * patientsPerPage
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + patientsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])



  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Patients</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your patient records</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => <PatientCardSkeleton key={i} />)
        ) : (
          paginatedPatients.map((patient) => (
          <div key={patient._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{patient.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">ID: {patient._id.slice(-6)}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="truncate">{patient.email}</span>
              </div>
              {patient.phone && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.dateOfBirth && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span>{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-xs sm:text-sm flex items-center justify-center space-x-1 transition-colors">
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">View Records</span>
                <span className="sm:hidden">Records</span>
              </button>
              <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded text-xs sm:text-sm transition-colors">
                Contact
              </button>
            </div>
          </div>
          ))
        )}
      </div>

      {!loading && filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No patients found</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            {searchTerm ? 'Try adjusting your search terms' : 'No patients registered yet'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredPatients.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 order-2 sm:order-1">
            Showing {startIndex + 1} to {Math.min(startIndex + patientsPerPage, filteredPatients.length)} of {filteredPatients.length} patients
          </div>
          <div className="flex space-x-1 sm:space-x-2 order-1 sm:order-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors ${
                    currentPage === page
                      ? 'text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  style={currentPage === page ? { background: 'linear-gradient(276.68deg, #38B7FF 20.18%, #3870FF 94.81%)' } : {}}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}