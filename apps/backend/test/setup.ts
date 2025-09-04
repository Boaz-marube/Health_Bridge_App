// Backend test setup for Health Bridge
import { Test } from '@nestjs/testing';

// Global test configuration
beforeAll(async () => {
  // Set test environment variables
  if (!process.env.NODE_ENV) {
    (process.env as any).NODE_ENV = 'test';
  }
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.DATABASE_URL = 'mongodb://localhost:27017/health_bridge_test';
});

// Clean up after tests
afterAll(async () => {
  // Close database connections, cleanup resources
});

// Mock external services for testing
// Add mocks here as needed when external services are integrated

// Health Bridge specific test utilities
export const createMockPatient = () => ({
  id: '507f1f77bcf86cd799439011',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  dateOfBirth: new Date('1990-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createMockDoctor = () => ({
  id: '507f1f77bcf86cd799439012',
  firstName: 'Dr. Jane',
  lastName: 'Smith',
  email: 'dr.smith@hospital.com',
  specialization: 'Cardiology',
  licenseNumber: 'MD123456',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createMockAppointment = () => ({
  id: '507f1f77bcf86cd799439013',
  patientId: '507f1f77bcf86cd799439011',
  doctorId: '507f1f77bcf86cd799439012',
  date: new Date('2024-01-15T10:00:00Z'),
  status: 'scheduled',
  notes: 'Regular checkup',
  createdAt: new Date(),
  updatedAt: new Date(),
});