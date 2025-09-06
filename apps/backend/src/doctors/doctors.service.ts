import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { DoctorSchedule } from './schemas/doctor-schedule.schema';
import { CreateDoctorScheduleDto } from './dtos/create-doctor-schedule.dto';
import { UserType } from '../auth/enums/user-type.enum';
import { Appointment } from '../appointments/schemas/appointment.schema';
import { Queue, QueueDocument } from '../queue/entities/queue.entity';
import { Patient, PatientDocument } from '../patients/entities/patient.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('DoctorSchedule') private scheduleModel: Model<DoctorSchedule>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async findAllDoctors() {
    return this.userModel.find({ userType: UserType.DOCTOR }).select('-password');
  }

  async findDoctorById(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  async getDoctorSchedule(doctorId: string) {
    return this.scheduleModel.find({ doctorId }).sort({ dayOfWeek: 1 });
  }

  async createSchedule(doctorId: string, scheduleDto: CreateDoctorScheduleDto) {
    const schedule = new this.scheduleModel({
      doctorId,
      ...scheduleDto,
    });
    return schedule.save();
  }

  async updateSchedule(doctorId: string, schedules: CreateDoctorScheduleDto[]) {
    await this.scheduleModel.deleteMany({ doctorId });
    const newSchedules = schedules.map(schedule => ({
      doctorId,
      ...schedule,
    }));
    return this.scheduleModel.insertMany(newSchedules);
  }

  async getDashboardData(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const todayAppointments = await this.appointmentModel
      .find({
        doctorId,
        appointmentDate: { $gte: today, $lt: tomorrow }
      })
      .populate('patientId', 'name email')
      .sort({ appointmentTime: 1 })
      .exec();

    // Get current queue
    const currentQueue = await this.queueModel
      .find({
        doctorId,
        queueDate: today.toISOString().split('T')[0],
        status: { $ne: 'cancelled' }
      })
      .populate('patientId', 'name email')
      .sort({ position: 1 })
      .exec();

    // Get total patients count
    const totalPatients = await this.appointmentModel
      .distinct('patientId', { doctorId })
      .exec();

    // Get pending reviews (completed appointments without notes)
    const pendingReviews = await this.appointmentModel
      .countDocuments({
        doctorId,
        status: 'completed',
        notes: { $exists: false }
      })
      .exec();

    // Get recent updates (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentUpdates = await this.appointmentModel
      .find({
        doctorId,
        updatedAt: { $gte: weekAgo }
      })
      .populate('patientId', 'name')
      .sort({ updatedAt: -1 })
      .limit(5)
      .exec();

    return {
      stats: {
        todayAppointments: todayAppointments.length,
        totalPatients: totalPatients.length,
        pendingReviews,
        queueLength: currentQueue.length
      },
      todaySchedule: todayAppointments,
      currentQueue,
      recentUpdates
    };
  }
}