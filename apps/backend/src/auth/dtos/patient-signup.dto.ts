import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class PatientSignupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsDateString()
  dateOfBirth: string;

  @IsOptional()
  @IsString()
  address?: string;
}
