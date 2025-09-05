import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { HealthRecordsModule } from './health-records/health-records.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/health_bridge',
      {
        onConnectionCreate: (connection) => {
          console.log('✅ Database connected successfully to MongoDB Atlas!');
          return connection;
        },
      },
    ),
    AuthModule,
    PatientsModule,
    HealthRecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
