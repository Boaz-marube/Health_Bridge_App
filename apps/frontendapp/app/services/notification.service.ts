import { apiService } from './api.service';

export interface Notification {
  _id: string;
  recipientId: string;
  recipientType: 'patient' | 'doctor' | 'staff';
  type: 'appointment_reminder' | 'medicine_reminder' | 'wellness_tip' | 'queue_update' | 'system_alert';
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: string;
  sentAt?: string;
  deliveredAt?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class NotificationService {
  async getNotifications(userId: string, userType: 'patient' | 'doctor' | 'staff'): Promise<Notification[]> {
    try {
      return await apiService.get(`/notifications/recipient/${userId}?type=${userType}`);
    } catch (error) {
      return [];
    }
  }

  async getUnreadNotifications(userId: string, userType: 'patient' | 'doctor' | 'staff'): Promise<Notification[]> {
    try {
      return await apiService.get(`/notifications/unread/${userId}?type=${userType}`);
    } catch (error) {
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiService.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(userId: string, userType: 'patient' | 'doctor' | 'staff'): Promise<void> {
    try {
      await apiService.patch(`/notifications/read-all/${userId}?type=${userType}`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async sendNotification(notificationData: {
    recipientId: string;
    recipientType: 'patient' | 'doctor' | 'staff';
    type: string;
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await apiService.post('/notifications', notificationData);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiService.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();