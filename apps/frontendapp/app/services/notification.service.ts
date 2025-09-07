import { apiService } from './api.service';
import { apiClient } from './api-client.service';

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
      return await apiClient.get<Notification[]>(`/notifications/recipient/${userId}?type=${userType}`);
    } catch (error) {
      console.warn('Notifications API unavailable, using localStorage fallback');
      const stored = localStorage.getItem(`notifications_${userType}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
  }

  async getUnreadNotifications(userId: string, userType: 'patient' | 'doctor' | 'staff'): Promise<Notification[]> {
    try {
      return await apiClient.get<Notification[]>(`/notifications/unread/${userId}?type=${userType}`);
    } catch (error) {
      console.warn('Unread notifications API unavailable, using localStorage fallback');
      const stored = localStorage.getItem(`notifications_${userType}_${userId}`);
      if (stored) {
        const notifications = JSON.parse(stored);
        return notifications.filter((n: Notification) => !n.isRead);
      }
      return [];
    }
  }

  async markAsRead(notificationId: string, userId?: string, userType?: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`, {});
    } catch (error) {
      console.warn('Mark as read API unavailable, using localStorage fallback');
      if (userId && userType) {
        const stored = localStorage.getItem(`notifications_${userType}_${userId}`);
        if (stored) {
          const notifications = JSON.parse(stored);
          const updated = notifications.map((notif: any) => 
            notif._id === notificationId ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
          );
          localStorage.setItem(`notifications_${userType}_${userId}`, JSON.stringify(updated));
        }
      }
    }
  }

  async markAllAsRead(userId: string, userType: 'patient' | 'doctor' | 'staff'): Promise<void> {
    try {
      await apiClient.patch(`/notifications/read-all/${userId}?type=${userType}`, {});
    } catch (error) {
      console.warn('Mark all as read API unavailable, using localStorage fallback');
      const stored = localStorage.getItem(`notifications_${userType}_${userId}`);
      if (stored) {
        const notifications = JSON.parse(stored);
        const updated = notifications.map((notif: any) => ({ 
          ...notif, 
          isRead: true, 
          readAt: new Date().toISOString() 
        }));
        localStorage.setItem(`notifications_${userType}_${userId}`, JSON.stringify(updated));
      }
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

  async createNotification(notification: {
    userId: string;
    userType: 'patient' | 'doctor' | 'staff';
    title: string;
    message: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) {
    try {
      return await apiClient.post('/notifications', {
        recipientId: notification.userId,
        recipientType: notification.userType,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority
      });
    } catch (error) {
      console.warn('Create notification API unavailable, using localStorage fallback');
      const newNotification = {
        _id: Date.now().toString(),
        recipientId: notification.userId,
        recipientType: notification.userType,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        status: 'delivered' as const,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const stored = localStorage.getItem(`notifications_${notification.userType}_${notification.userId}`);
      const notifications = stored ? JSON.parse(stored) : [];
      notifications.unshift(newNotification);
      localStorage.setItem(`notifications_${notification.userType}_${notification.userId}`, JSON.stringify(notifications));
      
      return newNotification;
    }
  }
}

export const notificationService = new NotificationService();