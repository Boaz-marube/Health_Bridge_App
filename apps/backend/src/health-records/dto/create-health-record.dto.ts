export class CreateHealthRecordDto {
  patientId: string;
  doctorId: string;
  type: string;
  title: string;
  description: string;
  attachments?: string[];
}