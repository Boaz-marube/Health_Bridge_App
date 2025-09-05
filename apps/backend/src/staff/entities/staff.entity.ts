import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StaffDocument = HydratedDocument<Staff>;

@Schema({ timestamps: true })
export class Staff {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  employeeId: string;

  @Prop({ required: true, enum: ['receptionist', 'nurse', 'admin', 'manager'] })
  role: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  shift: string; // morning, afternoon, night

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);