import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Queue, QueueDocument, QueueStatus, QueuePriority } from './entities/queue.entity';
import { CreateQueueDto } from './dto/create-queue.dto';

import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { InjectModel as InjectAppointmentModel } from '@nestjs/mongoose';
import { Appointment } from '../appointments/schemas/appointment.schema';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class QueueService {
  constructor(
    @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
    @InjectModel('Appointment') private appointmentModel: Model<Appointment>,
    @InjectModel('User') private userModel: Model<User>,
    private websocketGateway: WebSocketGatewayService,
  ) {}

  async joinQueue(patientId: string, doctorId: string, priority: string = QueuePriority.WALK_IN, appointmentId?: string): Promise<Queue> {
    try {
      console.log('joinQueue called with:', { patientId, doctorId, priority, appointmentId });
      
      const today = new Date().toISOString().split('T')[0];
      console.log('Today date:', today);
      
      // Check if patient already in queue
      const existing = await this.queueModel.findOne({
        patientId,
        doctorId,
        queueDate: today,
        status: { $in: [QueueStatus.WAITING, QueueStatus.IN_PROGRESS] }
      });
      
      if (existing) {
        console.log('Patient already in queue, returning existing');
        return existing;
      }

      console.log('Creating new queue entry');
      // Create queue entry
      const queueEntry = new this.queueModel({
        patientId,
        doctorId,
        appointmentId,
        queueDate: today,
        priority,
        status: QueueStatus.WAITING,
        position: 0, // Will be calculated
        arrivalTime: new Date()
      });

      console.log('Saving queue entry');
      const saved = await queueEntry.save();
      console.log('Queue entry saved, recalculating positions');
      
      await this.recalculatePositions(doctorId, today);
      console.log('Positions recalculated');
      
      return saved;
    } catch (error) {
      console.error('Error in joinQueue:', error);
      throw error;
    }
  }

  async recalculatePositions(doctorId: string, date: string): Promise<void> {
    // Get all waiting patients
    const queueItems = await this.queueModel
      .find({ 
        doctorId, 
        queueDate: date, 
        status: QueueStatus.WAITING 
      })
      .populate('patientId', 'name')
      .exec();

    // Sort by priority then arrival time
    const priorityOrder = { 'emergency': 1, 'appointment': 2, 'walk_in': 3 };
    queueItems.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] || 3;
      const bPriority = priorityOrder[b.priority] || 3;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
    });

    // Update positions
    for (let i = 0; i < queueItems.length; i++) {
      const newPosition = i + 1;
      await this.queueModel.findByIdAndUpdate(queueItems[i]._id, { 
        position: newPosition,
        estimatedWaitTime: this.calculateWaitTime(newPosition)
      });
      
      // Emit position update to patient
      this.websocketGateway.emitQueueUpdate(queueItems[i].patientId, {
        position: newPosition,
        estimatedWaitTime: this.calculateWaitTime(newPosition),
        status: QueueStatus.WAITING
      });
    }
  }

  async callNextPatient(doctorId: string): Promise<Queue | null> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get next patient in queue
    const nextPatient = await this.queueModel
      .findOne({
        doctorId,
        queueDate: today,
        status: QueueStatus.WAITING
      })
      .sort({ position: 1 })
      .populate('patientId', 'name')
      .exec();

    if (!nextPatient) return null;

    // Update status to in_progress
    nextPatient.status = QueueStatus.IN_PROGRESS;
    nextPatient.calledAt = new Date();
    await nextPatient.save();

    // Notify patient they're being called
    this.websocketGateway.emitQueueUpdate(nextPatient.patientId, {
      status: QueueStatus.IN_PROGRESS,
      message: "You're being called for your appointment!"
    });

    // Recalculate positions for remaining patients
    await this.recalculatePositions(doctorId, today);

    return nextPatient;
  }

  async completeConsultation(queueId: string): Promise<Queue> {
    const queueItem = await this.queueModel.findById(queueId);
    if (!queueItem) {
      throw new NotFoundException('Queue item not found');
    }

    queueItem.status = QueueStatus.COMPLETED;
    queueItem.completedAt = new Date();
    await queueItem.save();

    // Recalculate positions
    await this.recalculatePositions(queueItem.doctorId, queueItem.queueDate);

    return queueItem;
  }

  async getDoctorQueue(doctorId: string, date?: string): Promise<Queue[]> {
    const queueDate = date || new Date().toISOString().split('T')[0];
    
    // First get queue items
    const queueItems = await this.queueModel
      .find({ doctorId, queueDate })
      .sort({ status: 1, position: 1 })
      .exec();

    // Manually populate patient data from User collection
    const populatedItems = [];
    for (const item of queueItems) {
      const patient = await this.userModel.findById(item.patientId).select('name email').exec();
      populatedItems.push({
        _id: item._id,
        patientId: patient,
        doctorId: item.doctorId,
        appointmentId: item.appointmentId,
        queueDate: item.queueDate,
        position: item.position,
        status: item.status,
        priority: item.priority,
        arrivalTime: item.arrivalTime,
        estimatedWaitTime: item.estimatedWaitTime
      });
    }

    return populatedItems as any;
  }

  async getPatientQueueStatus(patientId: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    
    const queueItem = await this.queueModel
      .findOne({
        patientId,
        queueDate: today,
        status: { $in: [QueueStatus.WAITING, QueueStatus.IN_PROGRESS] }
      })
      .exec();

    if (!queueItem) {
      return {
        position: null,
        estimatedWaitTime: 0,
        status: 'not_in_queue'
      };
    }

    return {
      position: queueItem.position,
      estimatedWaitTime: queueItem.estimatedWaitTime,
      status: queueItem.status
    };
  }

  async fastTrackPatient(queueId: string): Promise<Queue> {
    const queueItem = await this.queueModel.findById(queueId);
    if (!queueItem) {
      throw new NotFoundException('Queue item not found');
    }

    // Set to emergency priority
    queueItem.priority = QueuePriority.EMERGENCY;
    await queueItem.save();

    // Recalculate positions
    await this.recalculatePositions(queueItem.doctorId, queueItem.queueDate);

    return queueItem;
  }

  private calculateWaitTime(position: number): number {
    // Estimate 15 minutes per patient
    return position * 15;
  }

  async removeFromQueue(queueId: string): Promise<void> {
    const queueItem = await this.queueModel.findById(queueId);
    if (!queueItem) {
      throw new NotFoundException('Queue item not found');
    }

    queueItem.status = QueueStatus.CANCELLED;
    await queueItem.save();

    // Recalculate positions
    await this.recalculatePositions(queueItem.doctorId, queueItem.queueDate);
  }

  async addTodaysAppointmentsToQueue(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('Syncing appointments for date:', today.toISOString().split('T')[0]);
    
    // Find all confirmed appointments for today
    const todaysAppointments = await this.appointmentModel
      .find({
        appointmentDate: { 
          $gte: today, 
          $lt: tomorrow 
        },
        status: { $in: ['confirmed', 'scheduled'] }
      })
      .exec();

    console.log('Found appointments:', todaysAppointments.length);

    for (const appointment of todaysAppointments) {
      try {
        // Check if patient is already in queue
        const existingQueue = await this.queueModel.findOne({
          patientId: appointment.patientId.toString(),
          doctorId: appointment.doctorId.toString(),
          queueDate: today.toISOString().split('T')[0],
          status: { $in: [QueueStatus.WAITING, QueueStatus.IN_PROGRESS] }
        });

        if (!existingQueue) {
          console.log('Adding patient to queue:', appointment.patientId);
          // Add to queue with appointment priority
          await this.joinQueue(
            appointment.patientId.toString(),
            appointment.doctorId.toString(),
            QueuePriority.APPOINTMENT,
            appointment._id.toString()
          );
        } else {
          console.log('Patient already in queue:', appointment.patientId);
        }
      } catch (error) {
        console.error('Error adding appointment to queue:', error.message);
      }
    }
  }

  async debugTodaysAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysAppointments = await this.appointmentModel
      .find({
        appointmentDate: { 
          $gte: today, 
          $lt: tomorrow 
        }
      })
      .exec();

    const currentQueue = await this.queueModel
      .find({
        queueDate: today.toISOString().split('T')[0]
      })
      .exec();

    return {
      today: today.toISOString().split('T')[0],
      appointmentsFound: todaysAppointments.length,
      appointments: todaysAppointments.map(apt => ({
        id: apt._id,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        date: apt.appointmentDate,
        time: apt.appointmentTime,
        status: apt.status
      })),
      queueItemsFound: currentQueue.length,
      queueItems: currentQueue.length
    };
  }
}