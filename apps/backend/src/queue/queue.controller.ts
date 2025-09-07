import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { QueuePriority } from './entities/queue.entity';

@Controller('queue')
@UseGuards(AuthenticationGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('join')
  async joinQueue(
    @Body() body: { doctorId: string; priority?: QueuePriority; appointmentId?: string },
    @Req() req
  ) {
    try {
      console.log('Join queue request:', { userId: req.userId, ...body });
      return this.queueService.joinQueue(
        req.userId,
        body.doctorId,
        body.priority || QueuePriority.WALK_IN,
        body.appointmentId
      );
    } catch (error) {
      console.error('Queue join error:', error);
      throw error;
    }
  }

  @Get('doctor/:doctorId')
  async getDoctorQueue(
    @Param('doctorId') doctorId: string,
    @Query('date') date?: string
  ) {
    return this.queueService.getDoctorQueue(doctorId, date);
  }

  @Get('patient/status')
  async getPatientQueueStatus(@Req() req) {
    return this.queueService.getPatientQueueStatus(req.userId);
  }

  @Post('call-next/:doctorId')
  async callNextPatient(@Param('doctorId') doctorId: string) {
    return this.queueService.callNextPatient(doctorId);
  }

  @Patch(':id/complete')
  async completeConsultation(@Param('id') id: string) {
    return this.queueService.completeConsultation(id);
  }

  @Patch(':id/fast-track')
  async fastTrackPatient(@Param('id') id: string) {
    return this.queueService.fastTrackPatient(id);
  }

  @Delete(':id')
  async removeFromQueue(@Param('id') id: string) {
    return this.queueService.removeFromQueue(id);
  }

  @Post('sync-appointments')
  async syncTodaysAppointments() {
    try {
      await this.queueService.addTodaysAppointmentsToQueue();
      return { message: 'Today\'s appointments synced to queue', success: true };
    } catch (error) {
      return { message: 'Failed to sync appointments: ' + error.message, success: false };
    }
  }

  @Get('debug/appointments')
  async debugTodaysAppointments() {
    return this.queueService.debugTodaysAppointments();
  }

  @Get('test')
  async testEndpoint(@Req() req) {
    return {
      message: 'Queue endpoint working',
      userId: req.userId,
      timestamp: new Date().toISOString()
    };
  }
}