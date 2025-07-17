// Global test setup
import { ConfigService } from '@nestjs/config';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '24h';
process.env.BCRYPT_ROUNDS = '10';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Global test utilities
export const createMockConfigService = (): Partial<ConfigService> => ({
  get: jest.fn((key: string) => {
    const config = {
      JWT_SECRET: 'test-jwt-secret-key',
      JWT_EXPIRES_IN: '24h',
      BCRYPT_ROUNDS: '10',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    };
    return config[key as keyof typeof config];
  }),
});

// Common test data factories
export const createMockStudent = (overrides = {}) => ({
  id: 'student-id-1',
  rollNumber: 'S001',
  admissionNo: 'ADM001',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: new Date('2010-01-01'),
  gender: 'MALE',
  address: '123 Main St',
  parentName: 'John Doe Sr',
  parentPhone: '+1234567890',
  parentEmail: 'parent@example.com',
  bloodGroup: 'O+',
  admissionDate: new Date(),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  classId: null,
  class: null,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-id-1',
  email: 'user@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'TEACHER',
  phone: '+1234567890',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Database mock factory
export const createMockDatabaseService = () => ({
  student: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  teacher: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  class: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  subject: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
});
