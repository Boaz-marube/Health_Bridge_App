import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HealthMetricDocument = HydratedDocument<HealthMetric>;

@Schema({ timestamps: true })
export class HealthMetric {
  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  recordedAt: Date;
}

export const HealthMetricSchema = SchemaFactory.createForClass(HealthMetric);