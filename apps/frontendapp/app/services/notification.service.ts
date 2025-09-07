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
  recipientName?: string;
  senderName?: string;
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
    senderId?: string;
  }): Promise<void> {
    try {
      // Add sender ID from localStorage if not provided
      const userData = localStorage.getItem('user');
      if (userData && !notificationData.senderId) {
        const user = JSON.parse(userData);
        notificationData.senderId = user.id;
      }
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

  async hideNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await apiService.patch(`/notifications/${notificationId}/hide`, { userId });
    } catch (error) {
      console.error('Backend not available, using delete as fallback:', error);
      // Fallback to delete if hide endpoint not available
      await this.deleteNotification(notificationId);
    }
  }

  async getSentNotifications(senderId: string): Promise<Notification[]> {
    try {
      return await apiService.get(`/notifications/sender/${senderId}`);
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
      return [];
    }
  }
}

export const notificationService = new NotificationService();