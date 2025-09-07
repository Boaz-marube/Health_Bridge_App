import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, Query, Patch } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentDto } from './dtos/update-appointment.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';

@Controller('appointments')
@UseGuards(AuthenticationGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req,
  ) {
    return this.appointmentsService.create(req.userId, createAppointmentDto);
  }

  @Get()
  async getUserAppointments(@Req() req) {
    return this.appointmentsService.findUserAppointments(req.userId, req.userType);
  }

  @Get('scheduled')
  async getScheduledAppointments(@Req() req) {
    return this.appointmentsService.getScheduledAppointments(req.userId, req.userType);
  }

  @Get('priority')
  async getPriorityAppointments(@Req() req) {
    return this.appointmentsService.getPriorityAppointments(req.userId, req.userType);
  }

  @Get('missed')
  async getMissedAppointments(@Req() req) {
    return this.appointmentsService.getMissedAppointments(req.userId, req.userType);
  }

  @Get('available-slots/:doctorId')
  async getAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableSlots(doctorId, date);
  }

  @Get(':id')
  async getAppointmentById(@Param('id') id: string) {
    return this.appointmentsService.findById(id);
  }

  @Put(':id')
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/complete')
  async completeAppointment(@Param('id') id: string) {
    return this.appointmentsService.complete(id);
  }

  @Delete(':id')
  async cancelAppointment(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }

  @Delete(':id/permanent')
  async deleteAppointment(@Param('id') id: string) {
    return this.appointmentsService.delete(id);
  }

  @Put(':id/confirm')
  async confirmAppointment(@Param('id') id: string) {
    return this.appointmentsService.confirm(id);
  }

  @Put(':id/reschedule')
  async rescheduleAppointment(
    @Param('id') id: string,
    @Body() rescheduleData: { appointmentDate: string; appointmentTime: string; rescheduleReason?: string; priority?: string }
  ) {
    return this.appointmentsService.reschedule(id, rescheduleData.appointmentDate, rescheduleData.appointmentTime, rescheduleData.rescheduleReason, rescheduleData.priority);
  }

  @Patch(':id/reschedule')
  async rescheduleAppointmentPatch(
    @Param('id') id: string,
    @Body() rescheduleData: { appointmentDate: string; appointmentTime: string; status?: string; rescheduleReason?: string; priority?: string }
  ) {
    return this.appointmentsService.reschedule(id, rescheduleData.appointmentDate, rescheduleData.appointmentTime, rescheduleData.rescheduleReason, rescheduleData.priority);
  }

  @Patch(':id/missed')
  async markAsMissed(@Param('id') id: string) {
    return this.appointmentsService.markAsMissed(id);
  }

  @Patch('batch-status')
  async batchUpdateStatus(@Body() batchData: { appointmentIds: string[], status: string, missedReason?: string, priority?: string }) {
    return this.appointmentsService.batchUpdateStatus(batchData);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() statusData: { status: string }) {
    return this.appointmentsService.updateStatus(id, statusData.status);
  }

  @Patch(':id/missed-reason')
  async updateMissedReason(@Param('id') id: string, @Body() reasonData: { reason: string }) {
    return this.appointmentsService.updateMissedReason(id, reasonData.reason);
  }

  @Patch(':id/cancel')
  async cancelAppointmentPatch(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }
}