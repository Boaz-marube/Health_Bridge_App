import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DoctorsService } from './doctors.service';
import { UserType } from '../auth/enums/user-type.enum';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let mockUserModel: any;
  let mockScheduleModel: any;

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn(),
      findById: jest.fn(),
    };
    mockScheduleModel = {
      find: jest.fn(),
      deleteMany: jest.fn(),
      insertMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorsService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('DoctorSchedule'), useValue: mockScheduleModel },
      ],
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all doctors', async () => {
    const mockDoctors = [{ name: 'Dr. Test', userType: UserType.DOCTOR }];
    mockUserModel.find.mockReturnValue({ select: jest.fn().mockResolvedValue(mockDoctors) });

    const result = await service.findAllDoctors();
    expect(mockUserModel.find).toHaveBeenCalledWith({ userType: UserType.DOCTOR });
    expect(result).toEqual(mockDoctors);
  });

  it('should find doctor by id', async () => {
    const mockDoctor = { _id: '123', name: 'Dr. Test' };
    mockUserModel.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockDoctor) });

    const result = await service.findDoctorById('123');
    expect(mockUserModel.findById).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockDoctor);
  });

  it('should get doctor schedule', async () => {
    const mockSchedule = [{ dayOfWeek: 1, startTime: '09:00' }];
    mockScheduleModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockSchedule) });

    const result = await service.getDoctorSchedule('123');
    expect(mockScheduleModel.find).toHaveBeenCalledWith({ doctorId: '123' });
    expect(result).toEqual(mockSchedule);
  });
});