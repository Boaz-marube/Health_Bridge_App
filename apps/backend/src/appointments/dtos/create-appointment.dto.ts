import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../enums/appointment-status.enum';

export class CreateAppointmentDto {
  @IsString()
  doctorId: string;

  @IsDateString()
  appointmentDate: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.SCHEDULED;
}