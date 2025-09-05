import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  recipientId: string;

  @Prop({ required: true, enum: ['patient', 'doctor', 'staff'] })
  recipientType: string;

  @Prop({ required: true, enum: ['appointment_reminder', 'medicine_reminder', 'wellness_tip', 'queue_update', 'system_alert'] })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' })
  status: string;

  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority: string;

  @Prop()
  scheduledFor: Date;

  @Prop()
  sentAt: Date;

  @Prop()
  deliveredAt: Date;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>; // Additional data like appointmentId, etc.
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);