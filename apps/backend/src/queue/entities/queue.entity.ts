import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QueueDocument = HydratedDocument<Queue>;

@Schema({ timestamps: true })
export class Queue {
  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  doctorId: string;

  @Prop({ required: true })
  appointmentId: string;

  @Prop({ required: true })
  queueDate: Date;

  @Prop({ required: true })
  position: number;

  @Prop({ required: true, enum: ['waiting', 'in_progress', 'completed', 'cancelled'] })
  status: string;

  @Prop({ enum: ['normal', 'priority', 'emergency'], default: 'normal' })
  priority: string;

  @Prop()
  estimatedWaitTime: number; // in minutes

  @Prop()
  checkedInAt: Date;

  @Prop()
  calledAt: Date;

  @Prop()
  completedAt: Date;

  @Prop()
  notes: string;
}

export const QueueSchema = SchemaFactory.createForClass(Queue);