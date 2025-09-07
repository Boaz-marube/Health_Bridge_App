import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';

export class CreateLabResultDto {
  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsString()
  testName: string;

  @IsDateString()
  testDate: string;

  @IsString()
  results: string;

  @IsEnum(['normal', 'abnormal', 'critical'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referenceRange?: string;

  @IsOptional()
  @IsString()
  units?: string;
}