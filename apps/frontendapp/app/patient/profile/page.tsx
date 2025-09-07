'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Calendar, MapPin, Edit, Heart, AlertTriangle, Droplets, Pill, Save, X, Plus } from 'lucide-react'
import { patientService } from '@/app/services/patient.service'
import { formatPatientName } from '@/app/lib/name-utils'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

export default function PatientProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [patientProfile, setPatientProfile] = useState<any>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditingMedical, setIsEditingMedical] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [medicalData, setMedicalData] = useState<any>({})
  const [profileData, setProfileData] = useState<any>({})

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const sessionData = localStorage.getItem('session')
    
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchPatientProfile(parsedUser.id)
    }
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData)
        setProfileImage(session.user?.image || null)
      } catch (error) {
        console.log('No session data found')
      }
    }
  }, [])

  const fetchPatientProfile = async (userId: string) => {
    const profile = await patientService.getProfile(userId)
    setPatientProfile(profile)
    setMedicalData(profile?.medicalHistory || {
      bloodGroup: '',
      allergies: [],
      currentMedications: [],
      chronicConditions: [],
      previousSurgeries: [],
      emergencyContact: { name: '', relationship: '', phone: '' }
    })
    setProfileData({
      name: profile?.name || user?.name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      dateOfBirth: profile?.dateOfBirth || '',
      gender: profile?.gender || ''
    })
    setLoading(false)
  }

  const handleMedicalEdit = () => {
    setIsEditingMedical(true)
  }

  const handleProfileEdit = () => {
    setIsEditingProfile(true)
  }

  const handleMedicalSave = async () => {
    try {
      // Update patient profile with medical data
      const updatedProfile = {
        ...patientProfile,
        medicalHistory: medicalData
      }
      // Here you would call the API to update the profile
      // await patientService.updateProfile(user.id, updatedProfile)
      setPatientProfile(updatedProfile)
      setIsEditingMedical(false)
    } catch (error) {
      console.error('Failed to update medical history:', error)
    }
  }

  const handleProfileSave = async () => {
    try {
      // Update patient profile with basic data
      const updatedProfile = {
        ...patientProfile,
        ...profileData
      }
      // Here you would call the API to update the profile
      // await patientService.updateProfile(user.id, updatedProfile)
      setPatientProfile(updatedProfile)
      setIsEditingProfile(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleMedicalCancel = () => {
    setMedicalData(patientProfile?.medicalHistory || {})
    setIsEditingMedical(false)
  }

  const handleProfileCancel = () => {
    setProfileData({
      name: patientProfile?.name || user?.name || '',
      phone: patientProfile?.phone || '',
      address: patientProfile?.address || '',
      dateOfBirth: patientProfile?.dateOfBirth || '',
      gender: patientProfile?.gender || ''
    })
    setIsEditingProfile(false)
  }

  const addArrayItem = (field: string) => {
    setMedicalData({
      ...medicalData,
      [field]: [...(medicalData[field] || []), '']
    })
  }

  const updateArrayItem = (field: string, index: number, value: string) => {
    const newArray = [...(medicalData[field] || [])]
    newArray[index] = value
    setMedicalData({
      ...medicalData,
      [field]: newArray
    })
  }

  const removeArrayItem = (field: string, index: number) => {
    const newArray = [...(medicalData[field] || [])]
    newArray.splice(index, 1)
    setMedicalData({
      ...medicalData,
      [field]: newArray
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal information</p>
        </div>
        {!isEditingProfile ? (
          <button 
            onClick={handleProfileEdit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={handleProfileSave}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center space-x-1"
            >
              <Save className="h-3 w-3" />
              <span>Save</span>
            </button>
            <button 
              onClick={handleProfileCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-1"
            >
              <X className="h-3 w-3" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-6 mb-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={formatPatientName(user?.name || '')}
                className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
          </div>
          
          {/* Basic Info */}
          <div>
            {isEditingProfile ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 text-gray-900 dark:text-white focus:outline-none mb-2"
                placeholder="Enter your name"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPatientName(patientProfile?.name || user?.name || '')}
              </h2>
            )}
            <p className="text-gray-600 dark:text-gray-400">Patient</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Patient ID: {user?.id?.slice(-8) || 'N/A'}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-white">{patientProfile?.email || user?.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                {isEditingProfile ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{patientProfile?.phone || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                {isEditingProfile ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{patientProfile?.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                {isEditingProfile ? (
                  <input
                    type="date"
                    value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                    className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {patientProfile?.dateOfBirth 
                      ? new Date(patientProfile.dateOfBirth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                {isEditingProfile ? (
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">{patientProfile?.gender || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical History Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medical History</h3>
          {!isEditingMedical ? (
            <button 
              onClick={handleMedicalEdit}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <Edit className="h-3 w-3" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleMedicalSave}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <Save className="h-3 w-3" />
                <span>Save</span>
              </button>
              <button 
                onClick={handleMedicalCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <X className="h-3 w-3" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Droplets className="h-5 w-5 text-red-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blood Group</p>
                {isEditingMedical ? (
                  <select
                    value={medicalData.bloodGroup || ''}
                    onChange={(e) => setMedicalData({...medicalData, bloodGroup: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {patientProfile?.medicalHistory?.bloodGroup || 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Allergies</p>
                  {isEditingMedical && (
                    <button 
                      onClick={() => addArrayItem('allergies')}
                      className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
                <div className="text-gray-900 dark:text-white">
                  {isEditingMedical ? (
                    <div className="space-y-2">
                      {(medicalData.allergies || []).map((allergy: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={allergy}
                            onChange={(e) => updateArrayItem('allergies', index, e.target.value)}
                            className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="Enter allergy"
                          />
                          <button 
                            onClick={() => removeArrayItem('allergies', index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    patientProfile?.medicalHistory?.allergies?.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {patientProfile.medicalHistory.allergies.map((allergy: string, index: number) => (
                          <li key={index} className="text-sm">{allergy}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No known allergies</p>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Pill className="h-5 w-5 text-blue-500 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Medications</p>
                  {isEditingMedical && (
                    <button 
                      onClick={() => addArrayItem('currentMedications')}
                      className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
                <div className="text-gray-900 dark:text-white">
                  {isEditingMedical ? (
                    <div className="space-y-2">
                      {(medicalData.currentMedications || []).map((medication: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={medication}
                            onChange={(e) => updateArrayItem('currentMedications', index, e.target.value)}
                            className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="Enter medication"
                          />
                          <button 
                            onClick={() => removeArrayItem('currentMedications', index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    patientProfile?.medicalHistory?.currentMedications?.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {patientProfile.medicalHistory.currentMedications.map((medication: string, index: number) => (
                          <li key={index} className="text-sm">{medication}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No current medications</p>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Heart className="h-5 w-5 text-red-500 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chronic Conditions</p>
                  {isEditingMedical && (
                    <button 
                      onClick={() => addArrayItem('chronicConditions')}
                      className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
                <div className="text-gray-900 dark:text-white">
                  {isEditingMedical ? (
                    <div className="space-y-2">
                      {(medicalData.chronicConditions || []).map((condition: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={condition}
                            onChange={(e) => updateArrayItem('chronicConditions', index, e.target.value)}
                            className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="Enter condition"
                          />
                          <button 
                            onClick={() => removeArrayItem('chronicConditions', index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    patientProfile?.medicalHistory?.chronicConditions?.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {patientProfile.medicalHistory.chronicConditions.map((condition: string, index: number) => (
                          <li key={index} className="text-sm">{condition}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No chronic conditions</p>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-purple-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Previous Surgeries</p>
                <div className="text-gray-900 dark:text-white">
                  {patientProfile?.medicalHistory?.previousSurgeries?.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {patientProfile.medicalHistory.previousSurgeries.map((surgery: any, index: number) => (
                        <li key={index} className="text-sm">
                          {surgery.procedure} ({new Date(surgery.date).getFullYear()})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No previous surgeries</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Emergency Contact</p>
                <div className="text-gray-900 dark:text-white">
                  {patientProfile?.emergencyContact ? (
                    <div className="text-sm space-y-1">
                      <p><strong>{patientProfile.emergencyContact.name}</strong></p>
                      <p>{patientProfile.emergencyContact.relationship}</p>
                      <p>{patientProfile.emergencyContact.phone}</p>
                    </div>
                  ) : (
                    <p>Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}