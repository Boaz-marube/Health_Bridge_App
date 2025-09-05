import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { DoctorSchedule, DoctorScheduleSchema } from '../doctors/schemas/doctor-schedule.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Appointment', schema: AppointmentSchema }]),
    MongooseModule.forFeature([{ name: 'DoctorSchedule', schema: DoctorScheduleSchema }]),
    AuthModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}