import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findUserAppointments: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      getAvailableSlots: jest.fn(),
    } as any;

    controller = new AppointmentsController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create appointment', async () => {
    const appointmentDto = { 
      doctorId: '123', 
      appointmentDate: '2025-09-09',
      startTime: '10:00',
      endTime: '11:00',
      reason: 'Test' 
    } as any;
    const mockReq = { userId: 'patient123' };
    const mockResult = { id: '456' } as any;

    (service.create as jest.Mock).mockResolvedValue(mockResult);

    const result = await controller.createAppointment(appointmentDto, mockReq);
    expect(service.create).toHaveBeenCalledWith('patient123', appointmentDto);
    expect(result).toEqual(mockResult);
  });

  it('should get user appointments', async () => {
    const mockReq = { userId: 'user123', userType: 'patient' };
    const mockAppointments = [{ id: '123' }] as any;

    (service.findUserAppointments as jest.Mock).mockResolvedValue(mockAppointments);

    const result = await controller.getUserAppointments(mockReq);
    expect(service.findUserAppointments).toHaveBeenCalledWith('user123', 'patient');
    expect(result).toEqual(mockAppointments);
  });

  it('should get available slots', async () => {
    const mockSlots = { availableSlots: [], bookedSlots: [] } as any;
    (service.getAvailableSlots as jest.Mock).mockResolvedValue(mockSlots);

    const result = await controller.getAvailableSlots('doctor123', '2025-09-09');
    expect(service.getAvailableSlots).toHaveBeenCalledWith('doctor123', '2025-09-09');
    expect(result).toEqual(mockSlots);
  });

  it('should cancel appointment', async () => {
    const mockResult = { id: '123', status: 'cancelled' } as any;
    (service.cancel as jest.Mock).mockResolvedValue(mockResult);

    const result = await controller.cancelAppointment('123');
    expect(service.cancel).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockResult);
  });
});