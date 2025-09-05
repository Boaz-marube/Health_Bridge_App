import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DoctorSchedule extends Document {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
  doctorId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 6 })
  dayOfWeek: number; // 0-6 (Sunday-Saturday)

  @Prop({ required: true })
  startTime: string; // "09:00"

  @Prop({ required: true })
  endTime: string; // "17:00"

  @Prop({ default: true })
  isActive: boolean;
}

export const DoctorScheduleSchema = SchemaFactory.createForClass(DoctorSchedule);