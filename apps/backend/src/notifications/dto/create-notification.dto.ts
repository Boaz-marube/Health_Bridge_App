export class CreateNotificationDto {
  recipientId: string;
  recipientType: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  scheduledFor?: string;
  metadata?: object;
}

export class UpdateNotificationDto {
  status?: string;
  isRead?: boolean;
}