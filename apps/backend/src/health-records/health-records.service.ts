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
