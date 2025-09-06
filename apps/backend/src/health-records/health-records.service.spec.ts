import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HealthRecordsService } from './health-records.service';

describe('HealthRecordsService', () => {
  let service: HealthRecordsService;
  let mockHealthRecordModel: any;
  let mockHealthMetricModel: any;

  beforeEach(async () => {
    mockHealthRecordModel = {
      find: jest.fn().mockReturnValue({ 
        populate: jest.fn().mockReturnValue({ exec: jest.fn() })
      }),
      findById: jest.fn().mockReturnValue({ 
        populate: jest.fn().mockReturnValue({ exec: jest.fn() })
      }),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    mockHealthMetricModel = {
      find: jest.fn().mockReturnValue({ 
        sort: jest.fn().mockReturnValue({ exec: jest.fn() })
      }),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthRecordsService,
        { provide: getModelToken('HealthRecord'), useValue: mockHealthRecordModel },
        { provide: getModelToken('HealthMetric'), useValue: mockHealthMetricModel },
      ],
    }).compile();

    service = module.get<HealthRecordsService>(HealthRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find records by patient', async () => {
    const mockRecords = [{ patientId: '123', diagnosis: 'Test diagnosis' }];
    mockHealthRecordModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecords)
      })
    });

    const result = await service.findRecordsByPatient('123');
    expect(mockHealthRecordModel.find).toHaveBeenCalledWith({ patientId: '123' });
    expect(result).toEqual(mockRecords);
  });

  it('should create health record', async () => {
    const recordData = { patientId: '123', diagnosis: 'Test diagnosis' };
    const mockRecordInstance = { save: jest.fn().mockResolvedValue({ _id: '456', ...recordData }) };
    mockHealthRecordModel = jest.fn().mockImplementation(() => mockRecordInstance);
    
    const service = new (require('./health-records.service').HealthRecordsService)(mockHealthRecordModel, mockHealthMetricModel);
    const result = await service.createRecord(recordData);
    expect(mockRecordInstance.save).toHaveBeenCalled();
  });

  it('should create health metric', async () => {
    const metricData = {
      patientId: '123',
      type: 'blood_pressure',
      value: 120,
      unit: 'mmHg',
      recordedAt: '2024-01-01T10:00:00Z'
    };
    const mockMetricInstance = { save: jest.fn().mockResolvedValue({ _id: '789', ...metricData }) };
    mockHealthMetricModel = jest.fn().mockImplementation(() => mockMetricInstance);
    
    const service = new (require('./health-records.service').HealthRecordsService)(mockHealthRecordModel, mockHealthMetricModel);
    const result = await service.createMetric(metricData);
    expect(mockMetricInstance.save).toHaveBeenCalled();
  });
});