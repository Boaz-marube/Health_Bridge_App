import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PatientsService } from './patients.service';
import { User } from '../auth/schemas/user.schema';

describe('PatientsService', () => {
  let service: PatientsService;
  let mockUserModel: any;

  beforeEach(async () => {
    const mockUserInstance = {
      save: jest.fn().mockResolvedValue({ _id: '456' })
    };
    
    mockUserModel = jest.fn().mockImplementation(() => mockUserInstance);
    Object.assign(mockUserModel, {
      find: jest.fn().mockReturnValue({ 
        select: jest.fn().mockReturnValue({ exec: jest.fn() })
      }),
      findById: jest.fn().mockReturnValue({ 
        select: jest.fn().mockReturnValue({ exec: jest.fn() })
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() })
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all patients', async () => {
    const mockPatients = [{ name: 'John Doe', email: 'john@test.com', userType: 'patient' }];
    const selectMock = { exec: jest.fn().mockResolvedValue(mockPatients) };
    mockUserModel.find.mockReturnValue({ select: jest.fn().mockReturnValue(selectMock) });

    const result = await service.findAll();
    expect(mockUserModel.find).toHaveBeenCalledWith({ userType: 'patient' });
    expect(result).toEqual(mockPatients);
  });

  it('should find patient by id', async () => {
    const mockPatient = { _id: '123', name: 'John Doe' };
    const selectMock = { exec: jest.fn().mockResolvedValue(mockPatient) };
    mockUserModel.findById.mockReturnValue({ select: jest.fn().mockReturnValue(selectMock) });

    const result = await service.findOne('123');
    expect(mockUserModel.findById).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockPatient);
  });


  it('should get patient dashboard', async () => {
    const mockPatient = { _id: '123', name: 'John Doe', email: 'john@test.com' };
    const selectMock = { exec: jest.fn().mockResolvedValue(mockPatient) };
    mockUserModel.findById.mockReturnValue({ select: jest.fn().mockReturnValue(selectMock) });

    const result = await service.getDashboard('123');
    expect(mockUserModel.findById).toHaveBeenCalledWith('123');
    expect(result).toHaveProperty('patient');
    expect(result).toHaveProperty('upcomingAppointments');
    expect(result).toHaveProperty('wellnessTips');
  });

});