import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { StaffTestController } from './staff-test.controller';
import { Staff, StaffSchema } from './entities/staff.entity';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
    AppointmentsModule,
  ],
  controllers: [StaffController, StaffTestController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}