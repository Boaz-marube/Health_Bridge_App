// Frontend test setup for Health Bridge
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock environment variables for testing
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
process.env.NEXT_PUBLIC_APP_NAME = 'Health Bridge Test';

// Global test utilities for Health Bridge components
global.mockPatientData = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  dateOfBirth: '1990-01-01',
};

global.mockDoctorData = {
  id: '2',
  firstName: 'Dr. Jane',
  lastName: 'Smith',
  specialization: 'Cardiology',
  email: 'dr.smith@hospital.com',
};

global.mockAppointmentData = {
  id: '3',
  patientId: '1',
  doctorId: '2',
  date: '2024-01-15T10:00:00Z',
  status: 'scheduled',
  notes: 'Regular checkup',
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  fetch.mockClear();
});