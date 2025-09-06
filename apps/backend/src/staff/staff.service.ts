import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Staff, StaffDocument } from './entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto } from './dto/create-staff.dto';
import { AppointmentsService } from '../appointments/appointments.service';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    private appointmentsService: AppointmentsService,
  ) {}

  async create(createStaffDto: CreateStaffDto) {
    const staff = new this.staffModel(createStaffDto);
    return staff.save();
  }

  async findAll() {
    return this.staffModel.find({ isActive: true }).exec();
  }

  async findOne(id: string) {
    const staff = await this.staffModel.findById(id).exec();
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  async findByUserId(userId: string) {
    const staff = await this.staffModel.findOne({ userId, isActive: true }).exec();
    if (!staff) {
      throw new NotFoundException(`Staff with user ID ${userId} not found`);
    }
    return staff;
  }

  async findByRole(role: string) {
    return this.staffModel.find({ role, isActive: true }).exec();
  }

  async findByDepartment(department: string) {
    return this.staffModel.find({ department, isActive: true }).exec();
  }

  async update(id: string, updateData: UpdateStaffDto) {
    const staff = await this.staffModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  async remove(id: string) {
    const staff = await this.staffModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  // Dashboard data for staff
  async getDashboardData(staffId: string) {
    const staff = await this.findOne(staffId);
    const todayAppointmentsCount = await this.appointmentsService.getTodaysAppointmentsCount();
    
    return {
      staff,
      todayAppointments: todayAppointmentsCount,
      queueStatus: [],
      notifications: [],
      stats: {
        totalAppointments: todayAppointmentsCount,
        waitingPatients: 0,
        completedToday: 0,
        pendingNotifications: 0,
      }
    };
  }
}