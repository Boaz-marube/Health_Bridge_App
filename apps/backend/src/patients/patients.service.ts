import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findAll() {
    return this.userModel.find({ userType: 'patient' }).select('-password').exec();
  }

  async findOne(id: string) {
    return this.userModel.findById(id).select('-password').exec();
  }

  async getDashboard(patientId: string) {
    try {
      // Get patient info
      const patient = await this.userModel.findById(patientId).select('-password').exec();
      
      // In a real implementation, you would aggregate from multiple collections:
      // - Appointments collection for upcoming appointments
      // - Queue collection for current position
      // - HealthRecords collection for recent notifications
      // - Prescriptions collection for active medications
      
      return {
        patient: {
          _id: patient._id,
          name: patient.name,
          email: patient.email
        },
        upcomingAppointments: [],
        queuePosition: {
          position: null,
          estimatedWaitTime: 0,
          status: 'not_in_queue'
        },
        wellnessTips: [
          "Stay hydrated - drink at least 8 glasses of water daily",
          "Take a 10-minute walk after meals to aid digestion",
          "Get 7-8 hours of quality sleep each night"
        ],
        recentNotifications: [],
        stats: {
          totalAppointments: 0,
          completedAppointments: 0,
          prescriptions: 0,
          labResults: 0
        }
      };
    } catch (error) {
      // Return fallback data on error
      return {
        upcomingAppointments: [],
        queuePosition: {
          position: null,
          estimatedWaitTime: 0,
          status: 'not_in_queue'
        },
        wellnessTips: [
          "Stay hydrated - drink at least 8 glasses of water daily",
          "Take a 10-minute walk after meals to aid digestion",
          "Get 7-8 hours of quality sleep each night"
        ],
        recentNotifications: [],
        stats: {
          totalAppointments: 0,
          completedAppointments: 0,
          prescriptions: 0,
          labResults: 0
        }
      };
    }
  }
}