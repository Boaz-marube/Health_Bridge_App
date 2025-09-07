import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dtos/create-prescription.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';

@Controller('prescriptions')
@UseGuards(AuthenticationGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  async createPrescription(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Get()
  async getAllPrescriptions(@Req() req) {
    return this.prescriptionsService.findAll(req.userId, req.userType);
  }

  @Get('patient/:patientId')
  async getPatientPrescriptions(@Param('patientId') patientId: string) {
    return this.prescriptionsService.findByPatientId(patientId);
  }

  @Get('doctor/:doctorId')
  async getDoctorPrescriptions(@Param('doctorId') doctorId: string) {
    return this.prescriptionsService.findByDoctorId(doctorId);
  }

  @Get(':id')
  async getPrescriptionById(@Param('id') id: string) {
    return this.prescriptionsService.findById(id);
  }
}