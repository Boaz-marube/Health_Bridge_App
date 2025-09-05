import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto, UpdateQueuePositionDto, UpdateQueueStatusDto } from './dto/create-queue.dto';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  addToQueue(@Body() createQueueDto: CreateQueueDto) {
    return this.queueService.addToQueue(createQueueDto);
  }

  @Get('doctor/:doctorId')
  getQueueByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string
  ) {
    return this.queueService.getQueueByDoctor(doctorId, date);
  }

  @Get('patient/:patientId')
  getQueueByPatient(@Param('patientId') patientId: string) {
    return this.queueService.getQueueByPatient(patientId);
  }

  @Get('stats/:doctorId')
  getQueueStats(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string
  ) {
    return this.queueService.getQueueStats(doctorId, date);
  }

  @Patch(':id/position')
  updatePosition(
    @Param('id') id: string,
    @Body() updateDto: UpdateQueuePositionDto
  ) {
    return this.queueService.updatePosition(id, updateDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateQueueStatusDto
  ) {
    return this.queueService.updateStatus(id, updateDto);
  }

  @Patch(':id/fast-track')
  fastTrackPatient(@Param('id') id: string) {
    return this.queueService.fastTrackPatient(id);
  }

  @Patch(':id/check-in')
  checkInPatient(@Param('id') id: string) {
    return this.queueService.checkInPatient(id);
  }
}