export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
}