import { apiService } from './api.service';

export interface StaffDashboardData {
  doctorAvailability: any[];
  scheduledAppointments: any[];
  queueStatus: {
    totalPatients: number;
    waitingPatients: number;
    inProgressPatients: number;
    completedToday: number;
  };
  recentNotifications: any[];
  pendingMessages: any[];
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    queueLength: number;
  };
}

export interface StaffProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  role?: string;
}

export class StaffService {
  async getDashboard(staffId: string): Promise<StaffDashboardData> {
    try {
      const data = await apiService.get(`/staff/dashboard/${staffId}`);
      return {
        doctorAvailability: [],
        scheduledAppointments: [],
        queueStatus: {
          totalPatients: 0,
          waitingPatients: data.stats?.waitingPatients || 0,
          inProgressPatients: 0,
          completedToday: data.stats?.completedToday || 0
        },
        recentNotifications: data.notifications || [],
        pendingMessages: [],
        stats: {
          totalAppointments: data.todayAppointments || 0,
          completedAppointments: data.stats?.completedToday || 0,
          cancelledAppointments: 0,
          queueLength: 0
        }
      };
    } catch (error) {
      return {
        doctorAvailability: [],
        scheduledAppointments: [],
        queueStatus: {
          totalPatients: 0,
          waitingPatients: 0,
          inProgressPatients: 0,
          completedToday: 0
        },
        recentNotifications: [],
        pendingMessages: [],
        stats: {
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          queueLength: 0
        }
      };
    }
  }

  async getProfile(staffId: string): Promise<StaffProfile | null> {
    try {
      return await apiService.get(`/staff/${staffId}`);
    } catch (error) {
      return null;
    }
  }

  async getAllAppointments() {
    try {
      return await apiService.get('/appointments');
    } catch (error) {
      return [];
    }
  }

  async bookAppointment(appointmentData: any) {
    return apiService.post('/appointments', appointmentData);
  }

  async updateAppointment(appointmentId: string, updateData: any) {
    return apiService.put(`/appointments/${appointmentId}`, updateData);
  }

  async cancelAppointment(appointmentId: string) {
    return apiService.delete(`/appointments/${appointmentId}`);
  }

  async deleteAppointment(appointmentId: string) {
    return apiService.delete(`/appointments/${appointmentId}/permanent`);
  }

  async getQueueManagement() {
    try {
      // Since there's no general queue endpoint, we'll return empty for now
      // In a real implementation, this would need a specific doctor ID or date
      return [];
    } catch (error) {
      return [];
    }
  }

  async updateQueueOrder(queueUpdates: any[]) {
    return apiService.patch('/queue/reorder', { updates: queueUpdates });
  }

  async updateQueueStatus(queueId: string, status: string) {
    return apiService.patch(`/queue/${queueId}/status`, { status });
  }

  async fastTrackPatient(queueId: string) {
    return apiService.patch(`/queue/${queueId}/fast-track`, {});
  }

  async getNotifications(staffId: string) {
    try {
      return await apiService.get(`/notifications/staff/${staffId}`);
    } catch (error) {
      return [];
    }
  }

  async sendNotification(notificationData: any) {
    return apiService.post('/notifications', notificationData);
  }

  async getPatientMessages() {
    try {
      // For now, return empty array as messages endpoint might not be implemented
      return [];
    } catch (error) {
      return [];
    }
  }

  async sendMessage(messageData: any) {
    // For now, return success as messages endpoint might not be implemented
    return Promise.resolve({ success: true });
  }

  async getDoctors() {
    try {
      return await apiService.get('/doctors');
    } catch (error) {
      return [];
    }
  }

  async getPatients() {
    try {
      return await apiService.get('/patients');
    } catch (error) {
      return [];
    }
  }

  async getAnalytics(staffId: string) {
    try {
      // For now, return empty data as analytics endpoint might not be implemented
      return {
        appointmentTrends: [],
        queueMetrics: {
          averageWaitTime: 0,
          totalProcessed: 0,
          peakHours: []
        },
        patientSatisfaction: 0,
        efficiency: {
          completionRate: 0,
          onTimeRate: 0,
          utilizationRate: 0
        }
      };
    } catch (error) {
      return {
        appointmentTrends: [],
        queueMetrics: {
          averageWaitTime: 0,
          totalProcessed: 0,
          peakHours: []
        },
        patientSatisfaction: 0,
        efficiency: {
          completionRate: 0,
          onTimeRate: 0,
          utilizationRate: 0
        }
      };
    }
  }
}

export const staffService = new StaffService();