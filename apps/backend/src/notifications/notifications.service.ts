import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './entities/notification.entity';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      status: 'sent', // Set to sent immediately
      sentAt: new Date(),
      scheduledFor: createNotificationDto.scheduledFor ? new Date(createNotificationDto.scheduledFor) : new Date(),
    });
    return notification.save();
  }

  async findByRecipient(recipientId: string, recipientType: string) {
    return this.notificationModel
      .find({ 
        recipientId, 
        recipientType,
        hiddenFor: { $ne: recipientId } // Exclude notifications hidden by this user
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findUnread(recipientId: string, recipientType: string) {
    return this.notificationModel
      .find({ 
        recipientId, 
        recipientType, 
        isRead: false,
        hiddenFor: { $ne: recipientId } // Exclude notifications hidden by this user
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(notificationId: string) {
    const notification = await this.notificationModel
      .findByIdAndUpdate(notificationId, { isRead: true }, { new: true })
      .exec();
      
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }
    
    return notification;
  }

  async markAllAsRead(recipientId: string, recipientType: string) {
    return this.notificationModel
      .updateMany(
        { recipientId, recipientType, isRead: false },
        { isRead: true }
      )
      .exec();
  }

  async updateStatus(notificationId: string, updateDto: UpdateNotificationDto) {
    const updateData: any = { ...updateDto };

    if (updateDto.status === 'sent') {
      updateData.sentAt = new Date();
    } else if (updateDto.status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const notification = await this.notificationModel
      .findByIdAndUpdate(notificationId, updateData, { new: true })
      .exec();
      
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }
    
    return notification;
  }

  // Appointment reminder notifications
  async createAppointmentReminder(appointmentId: string, patientId: string, appointmentDate: Date, doctorName: string) {
    const reminderDate = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before

    return this.create({
      recipientId: patientId,
      recipientType: 'patient',
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `You have an appointment with Dr. ${doctorName} tomorrow at ${appointmentDate.toLocaleTimeString()}.`,
      priority: 'high',
      scheduledFor: reminderDate.toISOString(),
      metadata: { appointmentId, doctorName, appointmentDate }
    });
  }

  // Medicine reminder notifications
  async createMedicineReminder(patientId: string, medicineName: string, dosage: string, time: string) {
    return this.create({
      recipientId: patientId,
      recipientType: 'patient',
      type: 'medicine_reminder',
      title: 'Medicine Reminder',
      message: `Time to take your ${medicineName} - ${dosage}`,
      priority: 'medium',
      metadata: { medicineName, dosage, time }
    });
  }

  // Queue update notifications
  async createQueueUpdateNotification(patientId: string, position: number, estimatedWaitTime: number) {
    return this.create({
      recipientId: patientId,
      recipientType: 'patient',
      type: 'queue_update',
      title: 'Queue Update',
      message: `You are now #${position} in the queue. Estimated wait time: ${estimatedWaitTime} minutes.`,
      priority: 'low',
      metadata: { position, estimatedWaitTime }
    });
  }

  // Wellness tips
  async createWellnessTip(patientId: string, tip: string) {
    return this.create({
      recipientId: patientId,
      recipientType: 'patient',
      type: 'wellness_tip',
      title: 'Health Tip',
      message: tip,
      priority: 'low',
      metadata: { category: 'wellness' }
    });
  }

  // Get pending notifications for processing
  async getPendingNotifications() {
    return this.notificationModel
      .find({ 
        status: 'pending',
        scheduledFor: { $lte: new Date() }
      })
      .sort({ priority: -1, scheduledFor: 1 })
      .exec();
  }

  // Staff notification dashboard
  async getStaffNotifications(staffId: string) {
    return this.notificationModel
      .find({ 
        recipientId: staffId,
        recipientType: 'staff'
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  // Get notifications sent by a specific sender
  async findBySender(senderId: string) {
    return this.notificationModel
      .find({ senderId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Hide notification for a specific user (soft delete)
  async hideNotification(notificationId: string, userId: string) {
    const notification = await this.notificationModel
      .findByIdAndUpdate(
        notificationId,
        { $addToSet: { hiddenFor: userId } },
        { new: true }
      )
      .exec();
      
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }
    
    return { message: 'Notification hidden successfully' };
  }

  // Delete notification (only for staff - hard delete)
  async deleteNotification(notificationId: string) {
    const notification = await this.notificationModel
      .findByIdAndDelete(notificationId)
      .exec();
      
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }
    
    return { message: 'Notification deleted successfully' };
  }
}