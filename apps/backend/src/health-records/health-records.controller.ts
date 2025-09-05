import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HealthRecordsService } from './health-records.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { CreateHealthMetricDto } from './dto/create-health-metric.dto';

@Controller()
export class HealthRecordsController {
  constructor(private readonly healthRecordsService: HealthRecordsService) {}

  @Post('patients/:patientId/health-records')
  createRecord(
    @Param('patientId') patientId: string,
    @Body() createHealthRecordDto: CreateHealthRecordDto,
  ) {
    return this.healthRecordsService.createRecord({
      ...createHealthRecordDto,
      patientId,
    });
  }

  @Post('patients/:patientId/metrics')
  createMetric(
    @Param('patientId') patientId: string,
    @Body() createHealthMetricDto: CreateHealthMetricDto,
  ) {
    return this.healthRecordsService.createMetric({
      ...createHealthMetricDto,
      patientId,
    });
  }

  @Get('patients/:patientId/health-records')
  findRecordsByPatient(@Param('patientId') patientId: string) {
    return this.healthRecordsService.findRecordsByPatient(patientId);
  }

  @Get('patients/:patientId/metrics')
  findMetricsByPatient(@Param('patientId') patientId: string) {
    return this.healthRecordsService.findMetricsByPatient(patientId);
  }

  @Get('health-records/:id')
  findRecordById(@Param('id') id: string) {
    return this.healthRecordsService.findRecordById(id);
  }

  @Patch('health-records/:id')
  updateRecord(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateHealthRecordDto>,
  ) {
    return this.healthRecordsService.updateRecord(id, updateData);
  }

  @Delete('health-records/:id')
  removeRecord(@Param('id') id: string) {
    return this.healthRecordsService.removeRecord(id);
  }
}