import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { DoctorSchedule, DoctorScheduleSchema } from './schemas/doctor-schedule.schema';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { Queue, QueueSchema } from '../queue/entities/queue.entity';
import { Patient, PatientSchema } from '../patients/entities/patient.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'DoctorSchedule', schema: DoctorScheduleSchema }]),
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    MongooseModule.forFeature([{ name: Queue.name, schema: QueueSchema }]),
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
    AuthModule,
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}