import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Queue, QueueDocument } from './entities/queue.entity';
import { CreateQueueDto, UpdateQueuePositionDto, UpdateQueueStatusDto } from './dto/create-queue.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
  ) {}

  async addToQueue(createQueueDto: CreateQueueDto) {
    // Get next position in queue for the doctor on that date
    const lastPosition = await this.queueModel
      .findOne({ 
        doctorId: createQueueDto.doctorId, 
        queueDate: new Date(createQueueDto.queueDate) 
      })
      .sort({ position: -1 })
      .exec();

    const position = lastPosition ? lastPosition.position + 1 : 1;

    const queue = new this.queueModel({
      ...createQueueDto,
      position,
      status: 'waiting',
      queueDate: new Date(createQueueDto.queueDate),
    });

    return queue.save();
  }

  async getQueueByDoctor(doctorId: string, date: string) {
    return this.queueModel
      .find({ 
        doctorId, 
        queueDate: new Date(date),
        status: { $ne: 'cancelled' }
      })
      .sort({ position: 1 })
      .exec();
  }

  async getQueueByPatient(patientId: string) {
    return this.queueModel
      .find({ 
        patientId,
        status: { $in: ['waiting', 'in_progress'] }
      })
      .sort({ queueDate: 1, position: 1 })
      .exec();
  }

  async updatePosition(queueId: string, updateDto: UpdateQueuePositionDto) {
    const queueItem = await this.queueModel.findById(queueId).exec();
    if (!queueItem) {
      throw new NotFoundException(`Queue item with ID ${queueId} not found`);
    }

    // Reorder queue positions
    await this.reorderQueue(queueItem.doctorId, queueItem.queueDate, queueId, updateDto.position);

    const updatedItem = await this.queueModel
      .findByIdAndUpdate(queueId, updateDto, { new: true })
      .exec();
      
    if (!updatedItem) {
      throw new NotFoundException(`Failed to update queue item with ID ${queueId}`);
    }
    
    return updatedItem;
  }

  async updateStatus(queueId: string, updateDto: UpdateQueueStatusDto) {
    const updateData: any = { ...updateDto };

    if (updateDto.status === 'in_progress') {
      updateData.calledAt = new Date();
    } else if (updateDto.status === 'completed') {
      updateData.completedAt = new Date();
    }

    const updatedItem = await this.queueModel
      .findByIdAndUpdate(queueId, updateData, { new: true })
      .exec();
      
    if (!updatedItem) {
      throw new NotFoundException(`Queue item with ID ${queueId} not found`);
    }
    
    return updatedItem;
  }

  async fastTrackPatient(queueId: string) {
    const queueItem = await this.queueModel.findById(queueId).exec();
    if (!queueItem) {
      throw new NotFoundException(`Queue item with ID ${queueId} not found`);
    }

    // Move to position 1 and mark as priority
    await this.reorderQueue(queueItem.doctorId, queueItem.queueDate, queueId, 1);

    return this.queueModel
      .findByIdAndUpdate(queueId, { 
        position: 1, 
        priority: 'priority' 
      }, { new: true })
      .exec();
  }

  async checkInPatient(queueId: string) {
    return this.queueModel
      .findByIdAndUpdate(queueId, { 
        checkedInAt: new Date(),
        status: 'waiting'
      }, { new: true })
      .exec();
  }

  async getQueueStats(doctorId: string, date: string) {
    const queueItems = await this.getQueueByDoctor(doctorId, date);
    
    let waiting = 0;
    let inProgress = 0;
    let completed = 0;
    
    queueItems.forEach(item => {
      if (item.status === 'waiting') waiting++;
      else if (item.status === 'in_progress') inProgress++;
      else if (item.status === 'completed') completed++;
    });
    
    return {
      total: queueItems.length,
      waiting,
      inProgress,
      completed,
      averageWaitTime: this.calculateAverageWaitTime(queueItems),
      estimatedWaitTime: this.calculateEstimatedWaitTime(queueItems),
    };
  }

  private async reorderQueue(doctorId: string, date: Date, excludeId: string, newPosition: number) {
    const queueItems = await this.queueModel
      .find({ 
        doctorId, 
        queueDate: date,
        _id: { $ne: excludeId },
        status: { $ne: 'cancelled' }
      })
      .sort({ position: 1 })
      .exec();

    // Reorder positions
    for (let i = 0; i < queueItems.length; i++) {
      const adjustedPosition = i + 1 >= newPosition ? i + 2 : i + 1;
      await this.queueModel
        .findByIdAndUpdate(queueItems[i]._id.toString(), { position: adjustedPosition })
        .exec();
    }
  }

  private calculateAverageWaitTime(queueItems: any[]): number {
    let totalWaitTime = 0;
    let completedCount = 0;
    
    queueItems.forEach(item => {
      if (item.status === 'completed' && item.checkedInAt && item.calledAt) {
        totalWaitTime += (item.calledAt.getTime() - item.checkedInAt.getTime());
        completedCount++;
      }
    });
    
    if (completedCount === 0) return 0;
    return Math.round(totalWaitTime / completedCount / 60000); // Convert to minutes
  }

  private calculateEstimatedWaitTime(queueItems: any[]): number {
    let waitingCount = 0;
    queueItems.forEach(item => {
      if (item.status === 'waiting') waitingCount++;
    });
    
    const averageConsultationTime = 15; // minutes
    return waitingCount * averageConsultationTime;
  }
}