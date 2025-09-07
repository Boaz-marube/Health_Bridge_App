import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get('recipient/:recipientId')
  findByRecipient(
    @Param('recipientId') recipientId: string,
    @Query('type') recipientType: string
  ) {
    return this.notificationsService.findByRecipient(recipientId, recipientType);
  }

  @Get('unread/:recipientId')
  findUnread(
    @Param('recipientId') recipientId: string,
    @Query('type') recipientType: string
  ) {
    return this.notificationsService.findUnread(recipientId, recipientType);
  }

  @Get('staff/:staffId')
  getStaffNotifications(@Param('staffId') staffId: string) {
    return this.notificationsService.getStaffNotifications(staffId);
  }

  @Get('pending')
  getPendingNotifications() {
    return this.notificationsService.getPendingNotifications();
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all/:recipientId')
  markAllAsRead(
    @Param('recipientId') recipientId: string,
    @Query('type') recipientType: string
  ) {
    return this.notificationsService.markAllAsRead(recipientId, recipientType);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateNotificationDto
  ) {
    return this.notificationsService.updateStatus(id, updateDto);
  }

  @Post('appointment-reminder')
  createAppointmentReminder(@Body() data: {
    appointmentId: string;
    patientId: string;
    appointmentDate: string;
    doctorName: string;
  }) {
    return this.notificationsService.createAppointmentReminder(
      data.appointmentId,
      data.patientId,
      new Date(data.appointmentDate),
      data.doctorName
    );
  }

  @Post('medicine-reminder')
  createMedicineReminder(@Body() data: {
    patientId: string;
    medicineName: string;
    dosage: string;
    time: string;
  }) {
    return this.notificationsService.createMedicineReminder(
      data.patientId,
      data.medicineName,
      data.dosage,
      data.time
    );
  }

  @Post('queue-update')
  createQueueUpdate(@Body() data: {
    patientId: string;
    position: number;
    estimatedWaitTime: number;
  }) {
    return this.notificationsService.createQueueUpdateNotification(
      data.patientId,
      data.position,
      data.estimatedWaitTime
    );
  }

  @Post('wellness-tip')
  createWellnessTip(@Body() data: {
    patientId: string;
    tip: string;
  }) {
    return this.notificationsService.createWellnessTip(data.patientId, data.tip);
  }

  @Delete(':id')
  deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }
}