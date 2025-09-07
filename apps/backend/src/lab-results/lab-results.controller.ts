import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { LabResultsService } from './lab-results.service';
import { CreateLabResultDto } from './dtos/create-lab-result.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';

@Controller('lab-results')
@UseGuards(AuthenticationGuard)
export class LabResultsController {
  constructor(private readonly labResultsService: LabResultsService) {}

  @Post()
  async createLabResult(@Body() createLabResultDto: CreateLabResultDto) {
    return this.labResultsService.create(createLabResultDto);
  }

  @Get('patient/:patientId')
  async getPatientLabResults(@Param('patientId') patientId: string) {
    return this.labResultsService.findByPatientId(patientId);
  }

  @Get('doctor/:doctorId')
  async getDoctorLabResults(@Param('doctorId') doctorId: string) {
    return this.labResultsService.findByDoctorId(doctorId);
  }

  @Get(':id')
  async getLabResultById(@Param('id') id: string) {
    return this.labResultsService.findById(id);
  }
}