import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationGuard } from '../guards/authentication.guard';

// Mock the AuthService to avoid dependency issues
const mockAuthService = {
  doctorSignup: jest.fn(),
  patientSignup: jest.fn(),
  login: jest.fn(),
  getUserProfile: jest.fn(),
  changePassword: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  refreshTokens: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should call doctorSignup', async () => {
    const doctorData = {
      name: 'Dr. Smith',
      email: 'doctor@test.com',
      password: 'password123',
      specialization: 'Cardiology',
      licenseNumber: 'MD123',
      phoneNumber: '+1234567890',
    };

    await controller.doctorSignUp(doctorData);
    expect(mockAuthService.doctorSignup).toHaveBeenCalledWith(doctorData);
  });

  it('should call patientSignup', async () => {
    const patientData = {
      name: 'Jane Doe',
      email: 'patient@test.com',
      password: 'password123',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      address: '123 Main St',
    };

    await controller.patientSignUp(patientData);
    expect(mockAuthService.patientSignup).toHaveBeenCalledWith(patientData);
  });

  it('should return user profile', async () => {
    const mockUser = { id: '123', name: 'Dr. Smith', userType: 'doctor' };
    mockAuthService.getUserProfile.mockResolvedValue(mockUser);

    const result = await controller.getProfile({ userId: '123' });
    expect(result).toEqual(mockUser);
  });
});
