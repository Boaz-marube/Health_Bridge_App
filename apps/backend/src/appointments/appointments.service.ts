import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './schemas/appointment.schema';
import { DoctorSchedule } from '../doctors/schemas/doctor-schedule.schema';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentDto } from './dtos/update-appointment.dto';
import { AppointmentStatus } from './enums/appointment-status.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel('Appointment') private appointmentModel: Model<Appointment>,
    @InjectModel('DoctorSchedule') private scheduleModel: Model<DoctorSchedule>,
  ) {}

  async create(patientId: string, createAppointmentDto: CreateAppointmentDto) {
    // Check for conflicts
    const existingAppointment = await this.appointmentModel.findOne({
      doctorId: createAppointmentDto.doctorId,
      appointmentDate: new Date(createAppointmentDto.appointmentDate),
      startTime: createAppointmentDto.startTime,
      status: { $ne: AppointmentStatus.CANCELLED },
    });

    if (existingAppointment) {
      throw new BadRequestException('Time slot already booked');
    }

    const appointment = new this.appointmentModel({
      patientId,
      ...createAppointmentDto,
      appointmentDate: new Date(createAppointmentDto.appointmentDate),
    });

    return appointment.save();
  }

  async findUserAppointments(userId: string, userType: string) {
    const filter = userType === 'doctor' 
      ? { doctorId: userId }
      : { patientId: userId };

    return this.appointmentModel
      .find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ appointmentDate: 1, startTime: 1 });
  }

  async findById(id: string) {
    return this.appointmentModel
      .findById(id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization');
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentModel.findByIdAndUpdate(
      id,
      updateAppointmentDto,
      { new: true }
    );
  }

  async cancel(id: string) {
    return this.appointmentModel.findByIdAndUpdate(
      id,
      { status: AppointmentStatus.CANCELLED },
      { new: true }
    );
  }

  async getAvailableSlots(doctorId: string, date: string) {
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();
    
    // Get doctor's schedule for this day
    const schedule = await this.scheduleModel.findOne({
      doctorId,
      dayOfWeek,
      isActive: true
    });
    
    if (!schedule) {
      return { availableSlots: [], message: 'Doctor not available on this day' };
    }
    
    // Get booked appointments
    const bookedSlots = await this.appointmentModel.find({
      doctorId,
      appointmentDate,
      status: { $ne: AppointmentStatus.CANCELLED },
    }).select('startTime endTime');
    
    // Generate time slots (1-hour intervals)
    const slots = [];
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const isBooked = bookedSlots.some(slot => slot.startTime === timeSlot);
      
      if (!isBooked) {
        slots.push({
          startTime: timeSlot,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          available: true
        });
      }
    }
    
    return { availableSlots: slots, bookedSlots };
  }
}