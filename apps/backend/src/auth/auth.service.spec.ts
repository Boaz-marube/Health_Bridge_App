import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserType } from './enums/user-type.enum';
import { MailService } from '../services/mail.service';
import { RolesService } from '../roles/roles.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;
  let mockMailService: any;
  let mockRolesService: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    mockMailService = {
      sendPasswordResetEmail: jest.fn(),
    };

    mockRolesService = {
      getRoleById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('RefreshToken'), useValue: {} },
        { provide: getModelToken('ResetToken'), useValue: {} },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
        { provide: RolesService, useValue: mockRolesService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('doctorSignup', () => {
    it('should create a doctor successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({});

      const doctorData = {
        name: 'Dr. Smith',
        email: 'doctor@test.com',
        password: 'password123',
        specialization: 'Cardiology',
        licenseNumber: 'MD123',
        phoneNumber: '+1234567890',
      };

      await service.doctorSignup(doctorData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        name: 'Dr. Smith',
        email: 'doctor@test.com',
        password: expect.any(String),
        userType: UserType.DOCTOR,
        specialization: 'Cardiology',
        licenseNumber: 'MD123',
        phoneNumber: '+1234567890',
      });
    });

    it('should throw error if email exists', async () => {
      mockUserModel.findOne.mockResolvedValue({ email: 'doctor@test.com' });

      await expect(
        service.doctorSignup({
          name: 'Dr. Smith',
          email: 'doctor@test.com',
          password: 'password123',
          specialization: 'Cardiology',
          licenseNumber: 'MD123',
          phoneNumber: '+1234567890',
        }),
      ).rejects.toThrow('Email already in use');
    });
  });

  describe('patientSignup', () => {
    it('should create a patient successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({});

      const patientData = {
        name: 'Jane Doe',
        email: 'patient@test.com',
        password: 'password123',
        phoneNumber: '+1234567890',
        dateOfBirth: '1990-01-01',
        address: '123 Main St',
      };

      await service.patientSignup(patientData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'patient@test.com',
        password: expect.any(String),
        userType: UserType.PATIENT,
        phoneNumber: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Main St',
      });
    });
  });
});
