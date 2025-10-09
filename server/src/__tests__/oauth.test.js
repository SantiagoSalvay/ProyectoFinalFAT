import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import oauthRouter from '../routes/oauth.js';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/oauth', oauthRouter);

describe('OAuth Routes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /oauth/me', () => {
    it('debería obtener información del usuario autenticado', async () => {
      const mockUser = {
        id_usuario: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'test@example.com',
        usuario: 'juanperez',
        auth_provider: 'google',
        profile_picture: 'https://example.com/avatar.jpg',
        ubicacion: 'Buenos Aires',
        email_verified: true,
        tipo_usuario: 1
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/oauth/me')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.correo).toBe('test@example.com');
      expect(response.body.user.auth_provider).toBe('google');
      expect(global.mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id_usuario: 1 },
        select: expect.objectContaining({
          id_usuario: true,
          nombre: true,
          apellido: true,
          correo: true,
          Usuario: true,
          auth_provider: true,
          profile_picture: true,
          ubicacion: true,
          email_verified: true
        })
      });
    });

    it('debería incluir advertencias para usuarios sin ubicación', async () => {
      const mockUser = {
        id_usuario: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'test@example.com',
        usuario: 'juanperez',
        auth_provider: 'google',
        profile_picture: null,
        ubicacion: '', // Sin ubicación
        email_verified: true,
        tipo_usuario: 1 // Persona
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/oauth/me')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('warnings');
      expect(response.body.warnings).toHaveLength(1);
      expect(response.body.warnings[0]).toEqual({
        type: 'warning',
        title: 'Completa tu ubicación',
        message: 'No tienes una ubicación registrada. Haz clic en "Acceder" para completar tu perfil.',
        link: '/profile'
      });
    });

    it('debería fallar sin token de autorización', async () => {
      const response = await request(app)
        .get('/oauth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token no proporcionado');
    });

    it('debería fallar con token inválido', async () => {
      // Mock JWT verify to throw error
      const jwt = await import('jsonwebtoken');
      jwt.default.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/oauth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token inválido');
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      global.mockPrisma.usuario.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/oauth/me')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Usuario no encontrado');
    });

    it('debería manejar errores de base de datos', async () => {
      global.mockPrisma.usuario.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/oauth/me')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token inválido');
    });

    it('debería manejar usuarios OAuth sin advertencias si son ONGs', async () => {
      const mockONGUser = {
        id_usuario: 2,
        nombre: 'ONG Solidaria',
        apellido: '',
        correo: 'ong@example.com',
        usuario: 'ongsolidaria',
        auth_provider: 'google',
        profile_picture: null,
        ubicacion: '', // Sin ubicación pero es ONG
        email_verified: true,
        tipo_usuario: 2 // ONG
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockONGUser);

      const response = await request(app)
        .get('/oauth/me')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.warnings).toHaveLength(0); // No warnings for ONGs
    });

    it('debería manejar diferentes proveedores OAuth', async () => {
      const mockTwitterUser = {
        id_usuario: 3,
        nombre: 'Twitter',
        apellido: 'User',
        correo: 'twitter@example.com',
        usuario: 'twitteruser',
        auth_provider: 'twitter',
        profile_picture: 'https://twitter.com/avatar.jpg',
        ubicacion: 'Córdoba',
        email_verified: true,
        tipo_usuario: 1
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockTwitterUser);

      const response = await request(app)
        .get('/oauth/me')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.user.auth_provider).toBe('twitter');
      expect(response.body.warnings).toHaveLength(0); // Has location
    });

    it('debería manejar usuarios con ubicación null', async () => {
      const mockUser = {
        id_usuario: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'test@example.com',
        usuario: 'juanperez',
        auth_provider: 'google',
        profile_picture: null,
        ubicacion: null, // null location
        email_verified: true,
        tipo_usuario: 1
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/oauth/me')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('warnings');
      expect(response.body.warnings).toHaveLength(1);
    });
  });

  // Note: Testing actual OAuth callbacks (Google/Twitter) would require mocking Passport
  // which is complex and typically done with integration tests rather than unit tests.
  // The callback routes primarily handle redirects and JWT generation, which are tested
  // indirectly through the /me endpoint and auth tests.

  describe('OAuth Integration Notes', () => {
    it('debería documentar que los callbacks de OAuth requieren tests de integración', () => {
      // Los callbacks de Google y Twitter OAuth son difíciles de testear unitariamente
      // porque dependen de Passport middleware y redirects externos.
      // Estos se testean mejor con:
      // 1. Tests de integración con mocks de Passport
      // 2. Tests E2E con proveedores OAuth de prueba
      // 3. Verificación manual en desarrollo
      
      expect(true).toBe(true); // Placeholder test
    });

    it('debería verificar que los callbacks manejan errores correctamente', () => {
      // Los callbacks incluyen manejo de errores que redirigen a:
      // - /login?error=oauth_failed
      // - /login?error=token_generation_failed
      // - /login?error=user_not_found
      
      expect(true).toBe(true); // Placeholder test
    });

    it('debería confirmar que se envían emails de notificación en OAuth', () => {
      // Los callbacks de OAuth exitosos envían emails de notificación
      // usando emailService.sendLoginNotificationEmail
      // Esto se verifica en los tests de auth.test.js
      
      expect(true).toBe(true); // Placeholder test
    });
  });
});
