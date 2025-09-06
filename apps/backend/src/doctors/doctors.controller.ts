import { Controller, Get, Post, Put, Param, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorScheduleDto } from './dtos/create-doctor-schedule.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';


@Controller('doctors')
@UseGuards(AuthenticationGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async getAllDoctors() {
    return this.doctorsService.findAllDoctors();
  }

  @Get(':id')
  async getDoctorById(@Param('id') id: string) {
    return this.doctorsService.findDoctorById(id);
  }

  @Get(':id/schedule')
  async getDoctorSchedule(@Param('id') id: string) {
    return this.doctorsService.getDoctorSchedule(id);
  }

  @Put(':id/schedule')
  async updateDoctorSchedule(
    @Param('id') id: string,
    @Body() schedules: CreateDoctorScheduleDto[],
    @Req() req,
  ) {
    // Allow doctors to update their own schedule
    if (req.userId !== id) {
      throw new ForbiddenException('Can only update your own schedule');
    }
    return this.doctorsService.updateSchedule(id, schedules);
  }

  @Get(':id/dashboard')
  async getDoctorDashboard(@Param('id') id: string) {
    return this.doctorsService.getDashboardData(id);
  }
}