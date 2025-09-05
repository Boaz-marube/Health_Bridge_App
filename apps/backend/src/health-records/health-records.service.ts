import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HealthRecord } from './entities/health-record.entity';
import { HealthMetric } from './entities/health-metric.entity';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { CreateHealthMetricDto } from './dto/create-health-metric.dto';

@Injectable()
export class HealthRecordsService {
  constructor(
    @InjectModel(HealthRecord.name) private healthRecordModel: Model<HealthRecord>,
    @InjectModel(HealthMetric.name) private healthMetricModel: Model<HealthMetric>,
  ) {}

  async createRecord(createHealthRecordDto: CreateHealthRecordDto): Promise<HealthRecord> {
    const record = new this.healthRecordModel({
      ...createHealthRecordDto,
      patientId: new Types.ObjectId(createHealthRecordDto.patientId),
      doctorId: new Types.ObjectId(createHealthRecordDto.doctorId),
    });
    return record.save();
  }

  async createMetric(createHealthMetricDto: CreateHealthMetricDto): Promise<HealthMetric> {
    const metric = new this.healthMetricModel({
      ...createHealthMetricDto,
      patientId: new Types.ObjectId(createHealthMetricDto.patientId),
    });
    return metric.save();
  }

  async findRecordsByPatient(patientId: string): Promise<HealthRecord[]> {
    return this.healthRecordModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMetricsByPatient(patientId: string): Promise<HealthMetric[]> {
    return this.healthMetricModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ recordedAt: -1 })
      .exec();
  }

  async findRecordById(id: string): Promise<HealthRecord> {
    const record = await this.healthRecordModel
      .findById(id)
      .populate('patientId')
      .populate('doctorId', 'firstName lastName')
      .exec();
    
    if (!record) {
      throw new NotFoundException(`Health record with ID ${id} not found`);
    }
    return record;
  }

  async updateRecord(id: string, updateData: Partial<CreateHealthRecordDto>): Promise<HealthRecord> {
    const record = await this.healthRecordModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('doctorId', 'firstName lastName')
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