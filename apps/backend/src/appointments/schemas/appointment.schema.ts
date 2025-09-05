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
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true, enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Prop({ required: true })
  reason: string;

  @Prop()
  notes: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);