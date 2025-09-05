import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from './enums/appointment-status.enum';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let mockAppointmentModel: any;
  let mockScheduleModel: any;

  beforeEach(async () => {
    mockAppointmentModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      save: jest.fn(),
      populate: jest.fn(),
    };
    mockScheduleModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getModelToken('Appointment'), useValue: mockAppointmentModel },
        { provide: getModelToken('DoctorSchedule'), useValue: mockScheduleModel },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error when slot is already booked', async () => {
    const appointmentDto = {
      doctorId: '123',
      appointmentDate: '2025-09-09',
      startTime: '10:00',
      endTime: '11:00',
      reason: 'Test',
    };

    mockAppointmentModel.findOne.mockResolvedValue({ id: 'existing' });

    await expect(service.create('patient123', appointmentDto)).rejects.toThrow(BadRequestException);
    expect(mockAppointmentModel.findOne).toHaveBeenCalled();
  });

  it('should throw error when slot is already booked', async () => {
    const appointmentDto = {
      doctorId: '123',
      appointmentDate: '2025-09-09',
      startTime: '10:00',
      endTime: '11:00',
      reason: 'Test',
    };

    mockAppointmentModel.findOne.mockResolvedValue({ id: 'existing' });

    await expect(service.create('patient123', appointmentDto)).rejects.toThrow(BadRequestException);
  });

  it('should find user appointments', async () => {
    const mockAppointments = [{ id: '123' }];
    mockAppointmentModel.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockAppointments),
        }),
      }),
    });

    const result = await service.findUserAppointments('user123', 'patient');
    expect(result).toEqual(mockAppointments);
  });
});