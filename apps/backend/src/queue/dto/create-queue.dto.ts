export class CreateQueueDto {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  queueDate: string;
  priority?: string;
  notes?: string;
}

export class UpdateQueuePositionDto {
  position: number;
  priority?: string;
}

export class UpdateQueueStatusDto {
  status: string;
  notes?: string;
}