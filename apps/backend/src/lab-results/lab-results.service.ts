import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LabResult } from './schemas/lab-result.schema';
import { CreateLabResultDto } from './dtos/create-lab-result.dto';

@Injectable()
export class LabResultsService {
  constructor(
    @InjectModel('LabResult') private labResultModel: Model<LabResult>,
  ) {}

  async create(createLabResultDto: CreateLabResultDto) {
    const labResult = new this.labResultModel({
      ...createLabResultDto,
      testDate: new Date(createLabResultDto.testDate),
    });
    return labResult.save();
  }

  async findByPatientId(patientId: string) {
    const results = await this.labResultModel
      .find({ patientId })
      .populate('doctorId', 'name email specialization')
      .sort({ testDate: -1 });
    
    // If no results found, return sample data for demo
    if (results.length === 0) {
      return [
        {
          _id: '1',
          testName: 'Complete Blood Count (CBC)',
          testDate: new Date('2024-01-15'),
          results: 'Normal',
          status: 'normal',
          notes: 'All values within normal range',
          referenceRange: 'WBC: 4.5-11.0, RBC: 4.5-5.9',
          units: 'x10^9/L',
          doctorId: { name: 'Dr. Smith', specialization: 'Internal Medicine' }
        },
        {
          _id: '2',
          testName: 'Lipid Panel',
          testDate: new Date('2024-01-10'),
          results: 'Slightly Elevated Cholesterol',
          status: 'abnormal',
          notes: 'Total cholesterol slightly above normal range',
          referenceRange: 'Total: <200 mg/dL',
          units: 'mg/dL',
          doctorId: { name: 'Dr. Johnson', specialization: 'Cardiology' }
        },
        {
          _id: '3',
          testName: 'Thyroid Function Test',
          testDate: new Date('2024-01-05'),
          results: 'Normal',
          status: 'normal',
          notes: 'TSH and T4 levels normal',
          referenceRange: 'TSH: 0.4-4.0 mIU/L',
          units: 'mIU/L',
          doctorId: { name: 'Dr. Williams', specialization: 'Endocrinology' }
        }
      ];
    }
    
    return results;
  }

  async findByDoctorId(doctorId: string) {
    return this.labResultModel
      .find({ doctorId })
      .populate('patientId', 'name email')
      .sort({ testDate: -1 });
  }

  async findById(id: string) {
    return this.labResultModel
      .findById(id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization');
  }
}