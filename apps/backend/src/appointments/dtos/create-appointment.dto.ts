import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../enums/appointment-status.enum';

export class CreateAppointmentDto {
  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsDateString()
  appointmentDate: string;

  @IsString()
  appointmentTime: string;

  @IsString()
  appointmentType: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.SCHEDULED;
}