import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QueueDocument = HydratedDocument<Queue>;

export enum QueueStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum QueuePriority {
  EMERGENCY = 'emergency',
  APPOINTMENT = 'appointment',
  WALK_IN = 'walk_in'
}

@Schema({ timestamps: true })
export class Queue {
  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  doctorId: string;

  @Prop()
  appointmentId?: string;

  @Prop({ required: true })
  queueDate: string;

  @Prop({ required: true })
  position: number;

  @Prop({ required: true, enum: Object.values(QueueStatus), default: QueueStatus.WAITING })
  status: QueueStatus;

  @Prop({ required: true, enum: Object.values(QueuePriority), default: QueuePriority.WALK_IN })
  priority: string;

  @Prop({ default: Date.now })
  arrivalTime: Date;

  @Prop()
  estimatedWaitTime: number;

  @Prop()
  calledAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  notes?: string;
}

export const QueueSchema = SchemaFactory.createForClass(Queue);