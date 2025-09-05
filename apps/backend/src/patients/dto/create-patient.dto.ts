export class CreatePatientDto {
  userId: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  bloodType?: string;
  allergies?: string[];
}