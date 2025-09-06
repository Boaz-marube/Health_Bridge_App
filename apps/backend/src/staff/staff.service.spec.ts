import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StaffService } from './staff.service';

describe('StaffService', () => {
  let service: StaffService;
  let mockStaffModel: any;

  beforeEach(async () => {
    const mockStaffInstance = {
      save: jest.fn().mockResolvedValue({ _id: '456' })
    };
    
    mockStaffModel = jest.fn().mockImplementation(() => mockStaffInstance);
    Object.assign(mockStaffModel, {
      find: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() })
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        { provide: getModelToken('Staff'), useValue: mockStaffModel },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all staff', async () => {
    const mockStaff = [{ name: 'Jane Smith', role: 'nurse', department: 'emergency' }];
    mockStaffModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockStaff) });

    const result = await service.findAll();
    expect(mockStaffModel.find).toHaveBeenCalled();
    expect(result).toEqual(mockStaff);
  });

  it('should find staff by id', async () => {
    const mockStaff = { _id: '123', name: 'Jane Smith', role: 'nurse' };
    mockStaffModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockStaff) });

    const result = await service.findOne('123');
    expect(mockStaffModel.findById).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockStaff);
  });



  it('should update staff member', async () => {
    const updateData = { role: 'senior_nurse' };
    const mockUpdatedStaff = { _id: '123', name: 'Jane Smith', role: 'senior_nurse' };
    mockStaffModel.findByIdAndUpdate.mockReturnValue({ 
      exec: jest.fn().mockResolvedValue(mockUpdatedStaff) 
    });

    const result = await service.update('123', updateData);
    expect(mockStaffModel.findByIdAndUpdate).toHaveBeenCalledWith('123', updateData, { new: true });
    expect(result).toEqual(mockUpdatedStaff);
  });
});