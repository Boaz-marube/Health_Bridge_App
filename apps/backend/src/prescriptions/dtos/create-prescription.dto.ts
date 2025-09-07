import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsString()
  medicationName: string;

  @IsString()
  dosage: string;

  @IsString()
  frequency: string;

  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsEnum(['active', 'completed', 'cancelled'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  prescribedDate: string;
}