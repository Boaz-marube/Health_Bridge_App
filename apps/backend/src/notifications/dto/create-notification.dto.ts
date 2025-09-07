import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  recipientId: string;

  @IsString()
  @IsEnum(['patient', 'doctor', 'staff'])
  recipientType: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  scheduledFor?: string;

  @IsOptional()
  @IsObject()
  metadata?: object;
}

export class UpdateNotificationDto {
  status?: string;
  isRead?: boolean;
}