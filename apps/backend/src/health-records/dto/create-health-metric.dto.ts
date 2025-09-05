export class CreateHealthMetricDto {
  patientId: string;
  type: string;
  value: number;
  unit: string;
  recordedAt: string;
}