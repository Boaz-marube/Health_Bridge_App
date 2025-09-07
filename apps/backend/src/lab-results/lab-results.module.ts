import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LabResultsController } from './lab-results.controller';
import { LabResultsService } from './lab-results.service';
import { LabResult, LabResultSchema } from './schemas/lab-result.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'LabResult', schema: LabResultSchema }]),
    AuthModule,
  ],
  controllers: [LabResultsController],
  providers: [LabResultsService],
  exports: [LabResultsService],
})
export class LabResultsModule {}