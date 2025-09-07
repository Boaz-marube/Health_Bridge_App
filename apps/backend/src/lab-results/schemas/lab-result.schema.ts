import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LabResult extends Document {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
  patientId: Types.ObjectId;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
  doctorId: Types.ObjectId;

  @Prop({ required: true })
  testName: string;

  @Prop({ required: true })
  testDate: Date;

  @Prop({ required: true })
  results: string;

  @Prop({ required: true, enum: ['normal', 'abnormal', 'critical'], default: 'normal' })
  status: string;

  @Prop()
  notes?: string;

  @Prop()
  referenceRange?: string;

  @Prop()
  units?: string;
}

export const LabResultSchema = SchemaFactory.createForClass(LabResult);