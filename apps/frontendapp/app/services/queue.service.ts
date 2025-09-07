import { apiService } from './api.service';

export enum QueuePriority {
  EMERGENCY = 'emergency',
  APPOINTMENT = 'appointment',
  WALK_IN = 'walk_in'
}

export interface QueueStatus {
  position: number | null;
  estimatedWaitTime: number;
  status: string;
  doctorName?: string;
}

export class QueueService {
  async joinQueue(doctorId: string, priority: QueuePriority = QueuePriority.WALK_IN, appointmentId?: string) {
    return apiService.post('/queue/join', { doctorId, priority, appointmentId });
  }

  async getPatientQueueStatus(): Promise<QueueStatus> {
    try {
      return await apiService.get('/queue/patient/status');
    } catch (error) {
      return {
        position: null,
        estimatedWaitTime: 0,
        status: 'not_in_queue'
      };
    }
  }

  async getDoctorQueue(doctorId: string, date?: string) {
    try {
      const params = date ? `?date=${date}` : '';
      return await apiService.get(`/queue/doctor/${doctorId}${params}`);
    } catch (error) {
      return [];
    }
  }

  async callNextPatient(doctorId: string) {
    return apiService.post(`/queue/call-next/${doctorId}`);
  }

  async completeConsultation(queueId: string) {
    return apiService.patch(`/queue/${queueId}/complete`);
  }

  async fastTrackPatient(queueId: string) {
    return apiService.patch(`/queue/${queueId}/fast-track`);
  }

  async removeFromQueue(queueId: string) {
    return apiService.delete(`/queue/${queueId}`);
  }
}

export const queueService = new QueueService();