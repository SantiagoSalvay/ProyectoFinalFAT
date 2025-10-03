import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth.js';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      // Mock Prisma responses
      global.mockPrisma.usuario.findFirst.mockResolvedValue(null);
      global.mockPrisma.registroPendiente.findFirst.mockResolvedValue(null);
      global.mockPrisma.tipoUsuario.findUnique.mockResolvedValue({ id_tipo_usuario: 1 });
      global.mockPrisma.registroPendiente.create.mockResolvedValue({
        id: 1,
        correo: 'test@example.com',
        verification_token: 'mock-uuid-token'
      });

      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'test@example.com',
        contrasena: 'password123',
        usuario: 'juanperez',
        ubicacion: 'Buenos Aires',
        tipo_usuario: '1'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('correo de verificación');
      expect(response.body).toHaveProperty('requiresVerification', true);
      expect(global.mockPrisma.registroPendiente.create).toHaveBeenCalled();
      expect(global.mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'mock-uuid-token'
      );
    });

    it('debería fallar si el correo ya está registrado', async () => {
      global.mockPrisma.usuario.findFirst.mockResolvedValue({
        id_usuario: 1,
        correo: 'test@example.com'
      });

      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'test@example.com',
        contrasena: 'password123',
        usuario: 'juanperez',
        tipo_usuario: '1'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('El correo ya está registrado');
    });

    it('debería fallar si faltan campos requeridos', async () => {
      const userData = {
        nombre: 'Juan',
        // Falta apellido, correo, etc.
        contrasena: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Todos los campos son requeridos');
    });

    it('debería permitir registro de ONG sin apellido', async () => {
      global.mockPrisma.usuario.findFirst.mockResolvedValue(null);
      global.mockPrisma.registroPendiente.findFirst.mockResolvedValue(null);
      global.mockPrisma.tipoUsuario.findUnique.mockResolvedValue({ id_tipo_usuario: 2 });
      global.mockPrisma.registroPendiente.create.mockResolvedValue({
        id: 1,
        correo: 'ong@example.com',
        verification_token: 'mock-uuid-token'
      });

      const ongData = {
        nombre: 'ONG Test',
        apellido: '', // ONG puede tener apellido vacío
        correo: 'ong@example.com',
        contrasena: 'password123',
        usuario: 'ongtest',
        ubicacion: 'Buenos Aires',
        tipo_usuario: '2'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(ongData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requiresVerification', true);
    });
  });

  describe('POST /auth/login', () => {
    it('debería hacer login exitosamente con credenciales válidas', async () => {
      const mockUser = {
        id_usuario: 1,
        usuario: 'testuser',
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'test@example.com',
        contrasena: 'hashed-password',
        ubicacion: 'Buenos Aires',
        id_tipo_usuario: 1
      };

      global.mockPrisma.usuario.findFirst.mockResolvedValue(mockUser);

      const loginData = {
        correo: 'test@example.com',
        contrasena: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login exitoso');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('contrasena');
      expect(global.mockEmailService.sendLoginNotificationEmail).toHaveBeenCalled();
    });

    it('debería fallar con credenciales inválidas', async () => {
      global.mockPrisma.usuario.findFirst.mockResolvedValue(null);

      const loginData = {
        correo: 'test@example.com',
        contrasena: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('debería fallar si faltan campos requeridos', async () => {
      const loginData = {
        correo: 'test@example.com'
        // Falta contraseña
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Correo y contraseña son requeridos');
    });
  });

  describe('GET /auth/profile', () => {
    it('debería obtener el perfil del usuario autenticado', async () => {
      const mockUser = {
        id_usuario: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        usuario: 'testuser',
        correo: 'test@example.com',
        ubicacion: 'Buenos Aires',
        bio: 'Mi biografía',
        id_tipo_usuario: 1,
        createdAt: new Date()
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.correo).toBe('test@example.com');
    });

    it('debería fallar sin token de autorización', async () => {
      const response = await request(app)
        .get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token no proporcionado');
    });

    it('debería incluir advertencias para usuarios sin ubicación', async () => {
      const mockUser = {
        id_usuario: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        usuario: 'testuser',
        correo: 'test@example.com',
        ubicacion: '', // Sin ubicación
        bio: null,
        id_tipo_usuario: 1, // Persona
        createdAt: new Date()
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('warnings');
      expect(response.body.warnings).toHaveLength(1);
      expect(response.body.warnings[0].type).toBe('warning');
    });
  });

  describe('POST /auth/request-password-reset', () => {
    it('debería enviar email de reset para usuario existente', async () => {
      const mockUser = {
        id_usuario: 1,
        correo: 'test@example.com'
      };

      global.mockPrisma.usuario.findFirst.mockResolvedValue(mockUser);
      global.mockPrisma.usuario.update.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/request-password-reset')
        .send({ correo: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('recibirás un enlace');
      expect(global.mockPasswordResetService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('debería responder igual para usuario inexistente (por seguridad)', async () => {
      global.mockPrisma.usuario.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/request-password-reset')
        .send({ correo: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('recibirás un enlace');
    });
  });

  describe('POST /auth/reset-password/:token', () => {
    it('debería resetear contraseña con token válido', async () => {
      const mockUser = {
        id_usuario: 1,
        correo: 'test@example.com',
        nombre: 'Juan',
        reset_token: 'valid-token',
        reset_token_expiry: new Date(Date.now() + 3600000) // 1 hora en el futuro
      };

      global.mockPrisma.usuario.findFirst.mockResolvedValue(mockUser);
      global.mockPrisma.usuario.update.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/reset-password/valid-token')
        .send({ nuevaContrasena: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Contraseña actualizada exitosamente');
      expect(global.mockPrisma.usuario.update).toHaveBeenCalledWith({
        where: { id_usuario: 1 },
        data: {
          contrasena: 'hashed-password',
          reset_token: null,
          reset_token_expiry: null
        }
      });
    });

    it('debería fallar con token inválido o expirado', async () => {
      global.mockPrisma.usuario.findFirst.mockResolvedValue(null);
      global.mockPrisma.usuario.findMany.mockResolvedValue([]);

      const response = await request(app)
        .post('/auth/reset-password/invalid-token')
        .send({ nuevaContrasena: 'newpassword123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Token inválido o expirado');
    });
  });

  describe('GET /auth/verify-email/:token', () => {
    it('debería verificar email y completar registro exitosamente', async () => {
      const mockPendingRegistration = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        usuario: 'testuser',
        correo: 'test@example.com',
        contrasena: 'hashed-password',
        id_tipo_usuario: 1,
        ubicacion: 'Buenos Aires',
        verification_token: 'valid-token'
      };

      const mockNewUser = {
        id_usuario: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        usuario: 'testuser',
        correo: 'test@example.com',
        contrasena: 'hashed-password',
        id_tipo_usuario: 1,
        ubicacion: 'Buenos Aires',
        email_verified: true
      };

      global.mockPrisma.registroPendiente.count.mockResolvedValue(1);
      global.mockPrisma.registroPendiente.findFirst.mockResolvedValue(mockPendingRegistration);
      global.mockPrisma.usuario.findFirst.mockResolvedValue(null);
      global.mockPrisma.tipoUsuario.findUnique.mockResolvedValue({ tipo_usuario: 1 });
      global.mockPrisma.usuario.create.mockResolvedValue(mockNewUser);
      global.mockPrisma.registroPendiente.delete.mockResolvedValue(mockPendingRegistration);

      const response = await request(app)
        .get('/auth/verify-email/valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('verified', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('contrasena');
      expect(global.mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
    });

    it('debería fallar con token inválido', async () => {
      global.mockPrisma.registroPendiente.count.mockResolvedValue(0);
      global.mockPrisma.registroPendiente.findFirst.mockResolvedValue(null);
      global.mockPrisma.usuario.findFirst.mockResolvedValue(null);
      global.mockPrisma.registroPendiente.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/auth/verify-email/invalid-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Token de verificación inválido');
    });

    it('debería manejar token ya utilizado', async () => {
      const mockExistingUser = {
        id_usuario: 1,
        correo: 'test@example.com',
        verification_token: 'used-token'
      };

      global.mockPrisma.registroPendiente.count.mockResolvedValue(0);
      global.mockPrisma.registroPendiente.findFirst.mockResolvedValue(null);
      global.mockPrisma.usuario.findFirst.mockResolvedValue(mockExistingUser);

      const response = await request(app)
        .get('/auth/verify-email/used-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('ya fue utilizado');
      expect(response.body).toHaveProperty('alreadyVerified', true);
    });
  });

  describe('POST /auth/resend-verification', () => {
    it('debería reenviar email de verificación exitosamente', async () => {
      const mockPendingRegistration = {
        id: 1,
        correo: 'test@example.com',
        verification_token: 'old-token'
      };

      global.mockPrisma.registroPendiente.findFirst.mockResolvedValue(mockPendingRegistration);
      global.mockPrisma.registroPendiente.update.mockResolvedValue({
        ...mockPendingRegistration,
        verification_token: 'mock-uuid-token'
      });

      const response = await request(app)
        .post('/auth/resend-verification')
        .send({ correo: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('reenviado el correo');
      expect(response.body).toHaveProperty('success', true);
      expect(global.mockEmailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('debería fallar si el usuario ya está verificado', async () => {
      const mockExistingUser = {
        id_usuario: 1,
        correo: 'test@example.com'
      };

      global.mockPrisma.registroPendiente.findFirst.mockResolvedValue(null);
      global.mockPrisma.usuario.findFirst.mockResolvedValue(mockExistingUser);

      const response = await request(app)
        .post('/auth/resend-verification')
        .send({ correo: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('ya está verificado');
    });
  });

  describe('PUT /auth/profile', () => {
    it('debería actualizar perfil exitosamente', async () => {
      const mockUpdatedUser = {
        id_usuario: 1,
        usuario: 'testuser',
        nombre: 'Juan Carlos',
        apellido: 'Pérez',
        correo: 'test@example.com',
        ubicacion: 'Córdoba',
        bio: 'Nueva biografía',
        id_tipo_usuario: 1,
        createdAt: new Date()
      };

      global.mockPrisma.usuario.update.mockResolvedValue(mockUpdatedUser);

      const updateData = {
        nombre: 'Juan Carlos',
        ubicacion: 'Córdoba',
        bio: 'Nueva biografía'
      };

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Perfil actualizado exitosamente');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.nombre).toBe('Juan Carlos');
    });

    it('debería fallar sin token de autorización', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .send({ nombre: 'Juan Carlos' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token no proporcionado');
    });
  });
});
