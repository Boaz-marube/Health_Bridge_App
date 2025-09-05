import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HealthRecordDocument = HydratedDocument<HealthRecord>;

@Schema({ timestamps: true })
export class HealthRecord {
  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  doctorId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];
}

export const HealthRecordSchema = SchemaFactory.createForClass(HealthRecord);