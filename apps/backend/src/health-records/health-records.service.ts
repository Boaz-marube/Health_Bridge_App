import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  HealthRecord,
  HealthRecordDocument,
} from './entities/health-record.entity';
import {
  HealthMetric,
  HealthMetricDocument,
} from './entities/health-metric.entity';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { CreateHealthMetricDto } from './dto/create-health-metric.dto';

@Injectable()
export class HealthRecordsService {
  constructor(
    @InjectModel(HealthRecord.name)
    private healthRecordModel: Model<HealthRecordDocument>,
    @InjectModel(HealthMetric.name)
    private healthMetricModel: Model<HealthMetricDocument>,
  ) {}

  async findAllRecords() {
    const records = await this.healthRecordModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
    
    // If no records found, return sample data for demo
    if (records.length === 0) {
      return [
        {
          _id: '1',
          patientId: '68b9e1b9a07ca37464d205e2',
          recordType: 'diagnosis',
          title: 'Annual Physical Examination',
          description: 'Routine annual checkup with comprehensive health assessment',
          date: new Date('2024-01-15'),
          doctorId: 'Dr. Smith',
          status: 'completed',
          createdAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          patientId: '68b9e1b9a07ca37464d205e2',
          recordType: 'prescription',
          title: 'Blood Pressure Medication',
          description: 'Prescribed Lisinopril 10mg daily for hypertension management',
          date: new Date('2024-01-10'),
          doctorId: 'Dr. Johnson',
          status: 'active',
          createdAt: new Date('2024-01-10')
        },
        {
          _id: '3',
          patientId: '68b9e1b9a07ca37464d205e2',
          recordType: 'test_result',
          title: 'Blood Work Results',
          description: 'Complete blood count and metabolic panel - all values normal',
          date: new Date('2024-01-05'),
          doctorId: 'Dr. Williams',
          status: 'completed',
          createdAt: new Date('2024-01-05')
        }
      ];
    }
    
    return records;
  }

  async createRecord(createHealthRecordDto: CreateHealthRecordDto) {
    const record = new this.healthRecordModel(createHealthRecordDto);
    return record.save();
  }

  async createMetric(createHealthMetricDto: CreateHealthMetricDto) {
    const metric = new this.healthMetricModel(createHealthMetricDto);
    return metric.save();
  }

  async findRecordsByPatient(patientId: string) {
    return this.healthRecordModel
      .find({ patientId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMetricsByPatient(patientId: string) {
    return this.healthMetricModel
      .find({ patientId })
      .sort({ recordedAt: -1 })
      .exec();
  }

  async findRecordById(id: string) {
    const record = await this.healthRecordModel.findById(id).exec();
    if (!record) {
      throw new NotFoundException(`Health record with ID ${id} not found`);
    }
    return record;
  }

  async updateRecord(id: string, updateData: Partial<CreateHealthRecordDto>) {
    const record = await this.healthRecordModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!record) {
      throw new NotFoundException(`Health record with ID ${id} not found`);
    }
    return record;
  }

  async removeRecord(id: string): Promise<void> {
    const result = await this.healthRecordModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Health record with ID ${id} not found`);
    }
  }
}
