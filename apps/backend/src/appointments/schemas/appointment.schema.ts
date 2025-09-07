import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { AppointmentStatus } from '../enums/appointment-status.enum';

@Schema({ timestamps: true })
export class Appointment extends Document {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
  patientId: Types.ObjectId;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
  doctorId: Types.ObjectId;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({ required: true })
  appointmentTime: string;

  @Prop({ required: true, enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Prop({ required: true })
  appointmentType: string;

  @Prop()
  notes: string;

  @Prop()
  reason?: string;

  @Prop({ default: 'normal' })
  priority?: string;

  @Prop()
  completedAt?: Date;

  @Prop()
  missedAt?: Date;

  @Prop({ default: 0 })
  rescheduleCount?: number;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Add middleware to set completion/missed timestamps
AppointmentSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate() as any;
  if (update.status === AppointmentStatus.COMPLETED) {
    update.completedAt = new Date();
  } else if (update.status === AppointmentStatus.NO_SHOW) {
    update.missedAt = new Date();
  }
});