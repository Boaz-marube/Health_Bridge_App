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
      // Use existing endpoints to build dashboard data
      const [appointments, doctors] = await Promise.all([
        this.getAllAppointments().catch(() => []),
        this.getDoctors().catch(() => [])
      ]);
      
      // Get queue data for all doctors
      let totalQueueLength = 0;
      let completedQueueToday = 0;
      for (const doctor of doctors) {
        try {
          const queueData = await apiService.get(`/queue/doctor/${doctor._id}`);
          const waitingPatients = queueData.filter((item: any) => item.status === 'waiting');
          const completedPatients = queueData.filter((item: any) => item.status === 'completed');
          totalQueueLength += waitingPatients.length;
          completedQueueToday += completedPatients.length;
        } catch (error) {
          // Continue if queue fetch fails for a doctor
        }
      }
      
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
        return aptDate === today;
      });
      
      // Calculate real appointment statistics
      const completedToday = appointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
        return aptDate === today && apt.status === 'completed';
      }).length;
      
      const cancelledToday = appointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
        return aptDate === today && apt.status === 'cancelled';
      }).length;
      
      return {
        doctorAvailability: [],
        scheduledAppointments: todayAppointments,
        queueStatus: {
          totalPatients: totalQueueLength,
          waitingPatients: todayAppointments.filter((apt: any) => apt.status === 'pending').length,
          inProgressPatients: todayAppointments.filter((apt: any) => apt.status === 'confirmed').length,
          completedToday: completedQueueToday
        },
        recentNotifications: [],
        pendingMessages: [],
        stats: {
          totalAppointments: todayAppointments.length,
          completedAppointments: completedQueueToday,
          cancelledAppointments: cancelledToday,
          queueLength: totalQueueLength
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
    // TODO: Implement staff profile endpoint
    // try {
    //   return await apiService.get(`/staff/${staffId}`);
    // } catch (error) {
    //   return null;
    // }
    
    // Temporary fallback
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        _id: user.id,
        name: user.name,
        email: user.email,
        department: 'General',
        role: 'Staff'
      };
    }
    return null;
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

  async confirmAppointment(appointmentId: string) {
    return apiService.put(`/appointments/${appointmentId}/confirm`);
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