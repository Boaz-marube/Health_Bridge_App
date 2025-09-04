import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { UserType } from '../enums/user-type.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserType, default: UserType.PATIENT })
  userType: UserType;

  @Prop({ required: false })
  phoneNumber: string;

  @Prop({ required: false })
  dateOfBirth: Date;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  specialization: string;

  @Prop({ required: false })
  licenseNumber: string;

  @Prop({ required: false, type: SchemaTypes.ObjectId })
  roleId: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
