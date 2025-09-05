import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';

describe('DoctorsController', () => {
  let controller: DoctorsController;
  let service: DoctorsService;

  beforeEach(() => {
    service = {
      findAllDoctors: jest.fn(),
      findDoctorById: jest.fn(),
      getDoctorSchedule: jest.fn(),
      updateSchedule: jest.fn(),
    } as any;

    controller = new DoctorsController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all doctors', async () => {
    const mockDoctors = [{ name: 'Dr. Test' }] as any;
    (service.findAllDoctors as jest.Mock).mockResolvedValue(mockDoctors);

    const result = await controller.getAllDoctors();
    expect(service.findAllDoctors).toHaveBeenCalled();
    expect(result).toEqual(mockDoctors);
  });

  it('should get doctor by id', async () => {
    const mockDoctor = { name: 'Dr. Test' } as any;
    (service.findDoctorById as jest.Mock).mockResolvedValue(mockDoctor);

    const result = await controller.getDoctorById('123');
    expect(service.findDoctorById).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockDoctor);
  });

  it('should get doctor schedule', async () => {
    const mockSchedule = [{ dayOfWeek: 1 }] as any;
    (service.getDoctorSchedule as jest.Mock).mockResolvedValue(mockSchedule);

    const result = await controller.getDoctorSchedule('123');
    expect(service.getDoctorSchedule).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockSchedule);
  });
});