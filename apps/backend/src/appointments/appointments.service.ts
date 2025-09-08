import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './schemas/appointment.schema';
import { DoctorSchedule } from '../doctors/schemas/doctor-schedule.schema';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentDto } from './dtos/update-appointment.dto';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { QueueService } from '../queue/queue.service';
import { QueuePriority } from '../queue/entities/queue.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel('Appointment') private appointmentModel: Model<Appointment>,
    @InjectModel('DoctorSchedule') private scheduleModel: Model<DoctorSchedule>,
    @Inject(forwardRef(() => WebSocketGatewayService)) private websocketGateway: WebSocketGatewayService,
    @Inject(forwardRef(() => QueueService)) private queueService: QueueService,
  ) {}

  async create(userId: string, createAppointmentDto: CreateAppointmentDto) {
    // Use patientId from DTO if provided (for staff bookings), otherwise use userId (for patient bookings)
    const patientId = createAppointmentDto.patientId || userId;
    const isStaffBooking = !!createAppointmentDto.patientId;
    
    // Check for conflicts
    const existingAppointment = await this.appointmentModel.findOne({
      doctorId: createAppointmentDto.doctorId,
      appointmentDate: new Date(createAppointmentDto.appointmentDate),
      appointmentTime: createAppointmentDto.appointmentTime,
      status: { $ne: AppointmentStatus.CANCELLED },
    });

    if (existingAppointment) {
      throw new BadRequestException('Time slot already booked');
    }

    // Set status based on who is booking
    const defaultStatus = isStaffBooking ? AppointmentStatus.CONFIRMED : AppointmentStatus.PENDING;

    const appointment = new this.appointmentModel({
      patientId,
      doctorId: createAppointmentDto.doctorId,
      appointmentDate: new Date(createAppointmentDto.appointmentDate),
      appointmentTime: createAppointmentDto.appointmentTime,
      appointmentType: createAppointmentDto.appointmentType,
      notes: createAppointmentDto.notes,
      status: createAppointmentDto.status || defaultStatus,
    });

    return appointment.save();
  }

  async findUserAppointments(userId: string, userType: string) {
    let filter = {};
    
    if (userType === 'doctor') {
      filter = { doctorId: userId };
    } else if (userType === 'patient') {
      filter = { patientId: userId };
    }
    // For staff, return all appointments (no filter)

    return this.appointmentModel
      .find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ appointmentDate: 1, appointmentTime: 1 });
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
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { status: AppointmentStatus.CANCELLED },
      { new: true }
    ).populate('patientId doctorId');

    // Emit real-time update to patient
    if (appointment) {
      this.websocketGateway.emitAppointmentUpdate(appointment.patientId.toString(), {
        appointmentId: appointment._id,
        status: AppointmentStatus.CANCELLED,
        message: 'Your appointment has been cancelled.'
      });
    }

    return appointment;
  }

  async delete(id: string) {
    return this.appointmentModel.findByIdAndDelete(id);
  }

  async confirm(id: string) {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { status: AppointmentStatus.CONFIRMED },
      { new: true }
    ).populate('patientId doctorId');

    if (appointment) {
      // Check if appointment is for today
      const today = new Date().toISOString().split('T')[0];
      const appointmentDate = new Date(appointment.appointmentDate).toISOString().split('T')[0];
      
      if (appointmentDate === today) {
        // Add patient to queue with appointment priority
        try {
          await this.queueService.joinQueue(
            appointment.patientId.toString(),
            appointment.doctorId.toString(),
            QueuePriority.APPOINTMENT,
            appointment._id.toString()
          );
        } catch (error) {
          // Patient might already be in queue, ignore error
        }
      }

      // Emit real-time update to patient
      this.websocketGateway.emitAppointmentUpdate(appointment.patientId.toString(), {
        appointmentId: appointment._id,
        status: AppointmentStatus.CONFIRMED,
        message: appointmentDate === today 
          ? 'Your appointment has been confirmed! You have been added to the queue.'
          : 'Your appointment has been confirmed!'
      });
    }

    return appointment;
  }

  async reschedule(id: string, newDate: string, newTime: string, rescheduleReason?: string, priority?: string) {
    const updateData: any = {
      appointmentDate: new Date(newDate),
      appointmentTime: newTime,
      status: AppointmentStatus.SCHEDULED
    };

    if (rescheduleReason) {
      updateData.reason = rescheduleReason;
    }

    if (priority) {
      updateData.priority = priority;
    } else {
      updateData.priority = 'high';
    }

    const appointment = await this.appointmentModel.findById(id);
    if (appointment) {
      updateData.rescheduleCount = (appointment.rescheduleCount || 0) + 1;
    }

    return this.appointmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('patientId doctorId');
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
    }).select('appointmentTime');
    
    // Generate time slots (1-hour intervals)
    const slots = [];
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const isBooked = bookedSlots.some(slot => slot.appointmentTime === timeSlot);
      
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

  async getTodaysAppointmentsCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.appointmentModel.countDocuments({
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $ne: AppointmentStatus.CANCELLED }
    });
  }

  async getScheduledAppointments(userId: string, userType: string) {
    let filter: any = {
      status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] }
    };
    
    if (userType === 'doctor') {
      filter.doctorId = userId;
    } else if (userType === 'patient') {
      filter.patientId = userId;
    }
    // For staff, return all scheduled appointments (no additional filter)

    return this.appointmentModel
      .find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ appointmentDate: 1, appointmentTime: 1 });
  }

  async complete(id: string) {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { status: AppointmentStatus.COMPLETED },
      { new: true }
    ).populate('patientId doctorId');

    if (appointment) {
      // Emit real-time update to patient
      this.websocketGateway.emitAppointmentUpdate(appointment.patientId.toString(), {
        appointmentId: appointment._id,
        status: AppointmentStatus.COMPLETED,
        message: 'Your appointment has been completed.'
      });
    }

    return appointment;
  }

  async markAsMissed(id: string) {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { status: AppointmentStatus.NO_SHOW },
      { new: true }
    ).populate('patientId doctorId');

    if (appointment) {
      // Emit real-time update to patient
      this.websocketGateway.emitAppointmentUpdate(appointment.patientId.toString(), {
        appointmentId: appointment._id,
        status: AppointmentStatus.NO_SHOW,
        message: 'You missed your appointment. Please reschedule.'
      });
    }

    return appointment;
  }

  async getPriorityAppointments(userId: string, userType: string) {
    let filter: any = {
      $or: [
        { status: { $in: [AppointmentStatus.NO_SHOW, AppointmentStatus.MISSED] } },
        { priority: { $in: ['high', 'urgent'] } }
      ]
    };
    
    if (userType === 'doctor') {
      filter.doctorId = userId;
    } else if (userType === 'patient') {
      filter.patientId = userId;
    }
    // For staff, return all priority appointments (no additional filter)

    return this.appointmentModel
      .find(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialization')
      .sort({ priority: -1, missedAt: -1, updatedAt: -1 });
  }

  async getMissedAppointments(userId: string, userType: string) {
    let filter: any = {
      status: { $in: [AppointmentStatus.NO_SHOW, AppointmentStatus.MISSED] }
    };
    
    if (userType === 'doctor') {
      filter.doctorId = userId;
    } else if (userType === 'patient') {
      filter.patientId = userId;
    }
    // For staff, return all missed appointments (no additional filter)

    return this.appointmentModel
      .find(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialization')
      .sort({ missedAt: -1, updatedAt: -1 });
  }

  async batchUpdateStatus(batchData: { appointmentIds: string[], status: string, missedReason?: string, priority?: string }) {
    const updateData: any = { status: batchData.status };
    
    if (batchData.missedReason) {
      updateData.reason = batchData.missedReason;
    }
    
    if (batchData.priority) {
      updateData.priority = batchData.priority;
    }

    if (batchData.status === AppointmentStatus.NO_SHOW || batchData.status === AppointmentStatus.MISSED) {
      updateData.missedAt = new Date();
    }

    return this.appointmentModel.updateMany(
      { _id: { $in: batchData.appointmentIds } },
      updateData
    );
  }

  async updateStatus(id: string, status: string) {
    const updateData: any = { status };
    
    if (status === AppointmentStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (status === AppointmentStatus.NO_SHOW || status === AppointmentStatus.MISSED) {
      updateData.missedAt = new Date();
    }

    return this.appointmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async updateMissedReason(id: string, reason: string) {
    const updateData: any = { reason };
    
    // Adjust priority based on reason
    if (reason === 'emergency' || reason === 'illness') {
      updateData.priority = 'urgent';
    } else if (reason === 'no_show') {
      updateData.priority = 'high';
    }

    return this.appointmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async getUpcomingReminders(userId: string, userType: string) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let filter: any = {
      appointmentDate: { $gte: now, $lte: tomorrow },
      status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
    };
    
    if (userType === 'doctor') {
      filter.doctorId = userId;
    } else if (userType === 'patient') {
      filter.patientId = userId;
    }
    
    return this.appointmentModel
      .find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ appointmentDate: 1, appointmentTime: 1 });
  }
}