import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  let service: QueueService;
  let mockQueueModel: any;

  beforeEach(async () => {
    const mockQueueInstance = {
      save: jest.fn().mockResolvedValue({ _id: '101', position: 1 })
    };
    
    mockQueueModel = jest.fn().mockImplementation(() => mockQueueInstance);
    Object.assign(mockQueueModel, {
      find: jest.fn().mockReturnValue({ 
        sort: jest.fn().mockReturnValue({ exec: jest.fn() })
      }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findOne: jest.fn().mockReturnValue({ 
        sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })
      }),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() })
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: getModelToken('Queue'), useValue: mockQueueModel },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get queue by doctor', async () => {
    const mockQueue = [{ doctorId: '123', patientId: '456', position: 1 }];
    mockQueueModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockQueue)
      })
    });

    const result = await service.getQueueByDoctor('123', '2024-01-01');
    expect(mockQueueModel.find).toHaveBeenCalledWith({
      doctorId: '123',
      queueDate: new Date('2024-01-01'),
      status: { $ne: 'cancelled' }
    });
    expect(result).toEqual(mockQueue);
  });

  it('should get queue by patient', async () => {
    const mockQueue = [{ patientId: '456', doctorId: '123', status: 'waiting' }];
    mockQueueModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockQueue)
      })
    });

    const result = await service.getQueueByPatient('456');
    expect(mockQueueModel.find).toHaveBeenCalledWith({
      patientId: '456',
      status: { $in: ['waiting', 'in_progress'] }
    });
    expect(result).toEqual(mockQueue);
  });

  it('should add patient to queue', async () => {
    const queueData = {
      doctorId: '123',
      patientId: '456',
      appointmentId: '789',
      queueDate: '2024-01-01'
    };
    const mockCreatedQueue = { _id: '101', ...queueData, position: 1 };
    mockQueueModel.create.mockResolvedValue(mockCreatedQueue);

    const result = await service.addToQueue(queueData);
    expect(mockQueueModel).toHaveBeenCalled();
  });
});