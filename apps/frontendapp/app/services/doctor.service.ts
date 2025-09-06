import { apiService } from './api.service';

export interface DashboardData {
  stats: {
    todayAppointments: number;
    totalPatients: number;
    pendingReviews: number;
    queueLength: number;
  };
  todaySchedule: any[];
  currentQueue: any[];
  recentUpdates: any[];
}

export interface DoctorProfile {
  _id: string;
  name: string;
  email: string;
  specialization?: string;
  department?: string;
}

export class DoctorService {
  async getDashboard(doctorId: string): Promise<DashboardData> {
    try {
      return await apiService.get(`/doctors/${doctorId}/dashboard`);
    } catch (error) {
      // Return fallback data on error
      return {
        stats: {
          todayAppointments: 0,
          totalPatients: 0,
          pendingReviews: 0,
          queueLength: 0,
        },
        todaySchedule: [],
        currentQueue: [],
        recentUpdates: [],
      };
    }
  }

  async getProfile(doctorId: string): Promise<DoctorProfile | null> {
    try {
      return await apiService.get(`/doctors/${doctorId}`);
    } catch (error) {
      return null;
    }
  }

  async getPatients() {
    try {
      return await apiService.get('/patients');
    } catch (error) {
      return [];
    }
  }

  async getQueue(doctorId: string, date: string) {
    try {
      return await apiService.get(`/queue/doctor/${doctorId}?date=${date}`);
    } catch (error) {
      return [];
    }
  }

  async updateQueueStatus(queueId: string, status: string) {
    return apiService.post(`/queue/${queueId}/status`, { status });
  }

  async fastTrackPatient(queueId: string) {
    return apiService.post(`/queue/${queueId}/fast-track`, {});
  }

  async getHealthRecords() {
    try {
      return await apiService.get('/health-records');
    } catch (error) {
      return [];
    }
  }

  async getPrescriptions() {
    try {
      return await apiService.get('/prescriptions');
    } catch (error) {
      return [];
    }
  }

  async getAppointments(doctorId: string) {
    try {
      return await apiService.get('/appointments');
    } catch (error) {
      return [];
    }
  }
}

export const doctorService = new DoctorService();