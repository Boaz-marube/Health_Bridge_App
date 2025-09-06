import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  let mockRoleModel: any;

  beforeEach(async () => {
    mockRoleModel = {
      find: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getModelToken('Role'), useValue: mockRoleModel },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create role', async () => {
    const roleData = { 
      name: 'doctor', 
      permissions: [{ resource: 'patients' as any, actions: ['read' as any, 'create' as any] }] 
    };
    const mockCreatedRole = { _id: '456', ...roleData };
    mockRoleModel.create.mockResolvedValue(mockCreatedRole);

    const result = await service.createRole(roleData);
    expect(mockRoleModel.create).toHaveBeenCalledWith(roleData);
    expect(result).toEqual(mockCreatedRole);
  });

  it('should find role by id', async () => {
    const mockRole = { _id: '123', name: 'admin', permissions: ['read', 'write'] };
    mockRoleModel.findById.mockResolvedValue(mockRole);

    const result = await service.getRoleById('123');
    expect(mockRoleModel.findById).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockRole);
  });


});