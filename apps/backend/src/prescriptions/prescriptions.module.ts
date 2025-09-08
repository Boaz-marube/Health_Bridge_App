import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { Prescription, PrescriptionSchema } from './schemas/prescription.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Prescription', schema: PrescriptionSchema }]),
    AuthModule,
  ],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}