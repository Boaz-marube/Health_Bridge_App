import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PatientDocument = HydratedDocument<Patient>;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  emergencyContact: string;

  @Prop()
  bloodType?: string;

  @Prop({ type: [String], default: [] })
  allergies: string[];
}

export const PatientSchema = SchemaFactory.createForClass(Patient);