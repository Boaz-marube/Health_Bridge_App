import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Prescription extends Document {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
  patientId: Types.ObjectId;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
  doctorId: Types.ObjectId;

  @Prop({ required: true })
  medicationName: string;

  @Prop({ required: true })
  dosage: string;

  @Prop({ required: true })
  frequency: string;

  @Prop({ required: true })
  duration: string;

  @Prop()
  instructions?: string;

  @Prop({ required: true, enum: ['active', 'completed', 'cancelled'], default: 'active' })
  status: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  prescribedDate: Date;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);