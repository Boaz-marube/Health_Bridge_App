import { IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';

export class CreateDoctorScheduleDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsBoolean()
  isActive: boolean = true;
}