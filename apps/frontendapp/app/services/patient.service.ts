import { apiService } from './api.service';

export interface PatientDashboardData {
  patient?: {
    _id: string;
    name: string;
    email: string;
  };
  upcomingAppointments: any[];
  queuePosition: {
    position: number | null;
    estimatedWaitTime: number;
    status: string;
  };
  wellnessTips: string[];
  recentNotifications: any[];
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    prescriptions: number;
    labResults: number;
  };
}

export interface PatientProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  department: string;
  available: boolean;
}

export class PatientService {
  async getDashboard(patientId: string): Promise<PatientDashboardData> {
    try {
      return await apiService.get(`/patients/${patientId}/dashboard`);
    } catch (error) {
      // Return fallback data on error
      return {
        upcomingAppointments: [],
        queuePosition: {
          position: null,
          estimatedWaitTime: 0,
          status: 'not_in_queue'
        },
        wellnessTips: [
          "Stay hydrated - drink at least 8 glasses of water daily",
          "Take a 10-minute walk after meals to aid digestion",
          "Get 7-8 hours of quality sleep each night"
        ],
        recentNotifications: [],
        stats: {
          totalAppointments: 0,
          completedAppointments: 0,
          prescriptions: 0,
          labResults: 0
        }
      };
    }
  }

  async getAppointments(patientId: string) {
    try {
      return await apiService.get('/appointments');
    } catch (error) {
      return [];
    }
  }

  async getDoctors() {
    try {
      return await apiService.get('/doctors');
    } catch (error) {
      return [];
    }
  }

  async bookAppointment(appointmentData: any) {
    return apiService.post('/appointments', appointmentData);
  }

  async rescheduleAppointment(appointmentId: string, rescheduleData: { appointmentDate: string; appointmentTime: string }) {
    return apiService.put(`/appointments/${appointmentId}/reschedule`, rescheduleData);
  }

  async cancelAppointment(appointmentId: string) {
    return apiService.delete(`/appointments/${appointmentId}`);
  }

  async getQueueStatus(patientId: string) {
    try {
      return await apiService.get(`/queue/patient/${patientId}`);
    } catch (error) {
      return {
        position: null,
        estimatedWaitTime: 0,
        status: 'not_in_queue'
      };
    }
  }

  async getMedicalHistory(patientId: string) {
    try {
      return await apiService.get(`/health-records/patient/${patientId}`);
    } catch (error) {
      return [];
    }
  }

  async getPrescriptions(patientId: string) {
    try {
      return await apiService.get(`/prescriptions/patient/${patientId}`);
    } catch (error) {
      return [];
    }
  }

  async getNotifications(patientId: string) {
    try {
      return await apiService.get(`/notifications/patient/${patientId}`);
    } catch (error) {
      return [];
    }
  }

  async getProfile(patientId: string): Promise<PatientProfile | null> {
    // Get from localStorage since API endpoints don't exist yet
    const stored = localStorage.getItem(`patient_profile_${patientId}`);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Return null if no stored profile
    return null;
  }

  async updateProfile(patientId: string, profileData: any) {
    // Store in localStorage since API endpoints don't exist yet
    localStorage.setItem(`patient_profile_${patientId}`, JSON.stringify(profileData));
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return profileData;
  }
}

export const patientService = new PatientService();