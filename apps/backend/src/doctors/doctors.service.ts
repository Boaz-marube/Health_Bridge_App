import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { DoctorSchedule } from './schemas/doctor-schedule.schema';
import { CreateDoctorScheduleDto } from './dtos/create-doctor-schedule.dto';
import { UserType } from '../auth/enums/user-type.enum';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('DoctorSchedule') private scheduleModel: Model<DoctorSchedule>,
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
}