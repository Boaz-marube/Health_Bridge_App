import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription } from './schemas/prescription.schema';
import { CreatePrescriptionDto } from './dtos/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectModel('Prescription') private prescriptionModel: Model<Prescription>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto) {
    const prescription = new this.prescriptionModel({
      ...createPrescriptionDto,
      prescribedDate: new Date(createPrescriptionDto.prescribedDate),
    });
    return prescription.save();
  }

  async findAll(userId: string, userType: string) {
    let filter = {};
    
    if (userType === 'doctor') {
      filter = { doctorId: userId };
    } else if (userType === 'patient') {
      filter = { patientId: userId };
    }
    // For staff, return all prescriptions (no filter)

    const prescriptions = await this.prescriptionModel
      .find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ prescribedDate: -1 });

    // If no prescriptions found, return sample data for demo
    if (prescriptions.length === 0) {
      return [
        {
          _id: '1',
          patientId: { name: 'John Doe', email: 'john@example.com' },
          doctorId: { name: 'Dr. Smith', specialization: 'Internal Medicine' },
          medicationName: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with food in the morning',
          status: 'active',
          notes: 'Monitor blood pressure weekly',
          prescribedDate: new Date('2024-01-15'),
          createdAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          patientId: { name: 'Jane Smith', email: 'jane@example.com' },
          doctorId: { name: 'Dr. Johnson', specialization: 'Cardiology' },
          medicationName: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '90 days',
          instructions: 'Take with meals',
          status: 'active',
          notes: 'Check blood sugar levels regularly',
          prescribedDate: new Date('2024-01-10'),
          createdAt: new Date('2024-01-10')
        },
        {
          _id: '3',
          patientId: { name: 'Bob Wilson', email: 'bob@example.com' },
          doctorId: { name: 'Dr. Williams', specialization: 'Family Medicine' },
          medicationName: 'Amoxicillin',
          dosage: '250mg',
          frequency: 'Three times daily',
          duration: '7 days',
          instructions: 'Complete full course even if feeling better',
          status: 'completed',
          notes: 'For bacterial infection treatment',
          prescribedDate: new Date('2024-01-05'),
          createdAt: new Date('2024-01-05')
        }
      ];
    }

    return prescriptions;
  }

  async findByPatientId(patientId: string) {
    return this.prescriptionModel
      .find({ patientId })
      .populate('doctorId', 'name email specialization')
      .sort({ prescribedDate: -1 });
  }

  async findByDoctorId(doctorId: string) {
    return this.prescriptionModel
      .find({ doctorId })
      .populate('patientId', 'name email')
      .sort({ prescribedDate: -1 });
  }

  async findById(id: string) {
    return this.prescriptionModel
      .findById(id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization');
  }
}