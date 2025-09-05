import { CreatePatientDto } from './create-patient.dto';

export class UpdatePatientDto {
  userId?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
}