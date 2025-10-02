import { jest } from '@jest/globals';

// Mock Prisma Client
const mockPrismaClient = {
  usuario: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  registroPendiente: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn()
  },
  foro: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  categoria: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn()
  },
  foroCategoria: {
    create: jest.fn(),
    findMany: jest.fn()
  },
  tipoUsuario: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn()
  },
  tipoONG: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  pedidoDonacion: {
    findMany: jest.fn(),
    create: jest.fn()
  }
};

// Mock @prisma/client
jest.unstable_mockModule('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

// Mock email service
const mockEmailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendLoginNotificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordChangeNotificationEmail: jest.fn().mockResolvedValue(true)
};

jest.unstable_mockModule('../../lib/email-service.js', () => ({
  emailService: mockEmailService
}));

// Mock password reset service
const mockPasswordResetService = {
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
};

jest.unstable_mockModule('../../lib/password-reset-service.js', () => ({
  passwordResetService: mockPasswordResetService
}));

// Mock JWT
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(() => 'mock-jwt-token'),
    verify: jest.fn(() => ({ userId: 1, email: 'test@example.com' }))
  }
}));

// Mock bcryptjs
jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: jest.fn(() => Promise.resolve('hashed-password')),
    compare: jest.fn(() => Promise.resolve(true))
  }
}));

// Mock uuid
jest.unstable_mockModule('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-token')
}));

// Global test utilities
global.mockPrisma = mockPrismaClient;
global.mockEmailService = mockEmailService;
global.mockPasswordResetService = mockPasswordResetService;

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Set up environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';

