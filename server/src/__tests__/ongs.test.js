import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import ongsRouter from '../routes/ongs.js';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/ongs', ongsRouter);

describe('ONGs API', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/ongs', () => {
    it('debería obtener la lista de ONGs formateadas', async () => {
      const mockOngs = [
        {
          id_usuario: 1,
          nombre: 'ONG Solidaria',
          apellido: null,
          correo: 'ong1@example.com',
          ubicacion: 'Buenos Aires',
          usuario: 'ongsolidaria',
          createdAt: new Date('2024-01-01'),
          bio: 'Ayudamos a la comunidad'
        },
        {
          id_usuario: 2,
          nombre: 'Fundación Esperanza',
          apellido: '',
          correo: 'esperanza@example.com',
          ubicacion: 'Córdoba',
          usuario: 'esperanza',
          createdAt: new Date('2024-01-02'),
          bio: null
        }
      ];

      global.mockPrisma.usuario.findMany.mockResolvedValue(mockOngs);

      const response = await request(app).get('/api/ongs');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ongs');
      expect(Array.isArray(response.body.ongs)).toBe(true);
      expect(response.body.ongs).toHaveLength(2);

      // Verificar formato de respuesta
      const firstOng = response.body.ongs[0];
      expect(firstOng).toHaveProperty('id', 1);
      expect(firstOng).toHaveProperty('name', 'ONG Solidaria');
      expect(firstOng).toHaveProperty('description', 'Ayudamos a la comunidad');
      expect(firstOng).toHaveProperty('location', 'Buenos Aires');
      expect(firstOng).toHaveProperty('email', 'ong1@example.com');
      expect(firstOng).toHaveProperty('type', 'public');
      expect(firstOng).toHaveProperty('rating', 4.5);
      expect(firstOng).toHaveProperty('volunteers_count');
      expect(firstOng).toHaveProperty('projects_count');
      expect(firstOng).toHaveProperty('website', 'https://ongsolidaria.org');
      expect(firstOng).toHaveProperty('phone', '+54 9 11 1234-5678');

      expect(global.mockPrisma.usuario.findMany).toHaveBeenCalledWith({
        where: {
          tipo_usuario: 2
        },
        select: {
          id_usuario: true,
          nombre: true,
          apellido: true,
          correo: true,
          ubicacion: true,
          usuario: true,
          createdAt: true,
          bio: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });

    it('debería filtrar ONGs por ubicación', async () => {
      const mockOngs = [
        {
          id_usuario: 1,
          nombre: 'ONG Buenos Aires',
          apellido: null,
          correo: 'ong1@example.com',
          ubicacion: 'Buenos Aires',
          usuario: 'ongba',
          createdAt: new Date(),
          bio: 'ONG en Buenos Aires'
        }
      ];

      global.mockPrisma.usuario.findMany.mockResolvedValue(mockOngs);

      const response = await request(app)
        .get('/api/ongs')
        .query({ location: 'Buenos Aires' });

      expect(response.status).toBe(200);
      expect(global.mockPrisma.usuario.findMany).toHaveBeenCalledWith({
        where: {
          tipo_usuario: 2,
          ubicacion: {
            contains: 'Buenos Aires',
            mode: 'insensitive'
          }
        },
        select: expect.any(Object),
        orderBy: expect.any(Object)
      });
    });

    it('debería filtrar ONGs por tipo', async () => {
      const mockOngs = [
        {
          id_usuario: 1,
          nombre: 'ONG Test',
          apellido: null,
          correo: 'test@example.com',
          ubicacion: 'Test Location',
          usuario: 'testong',
          createdAt: new Date(),
          bio: 'Test ONG'
        }
      ];

      global.mockPrisma.usuario.findMany.mockResolvedValue(mockOngs);

      const response = await request(app)
        .get('/api/ongs')
        .query({ type: 'public' });

      expect(response.status).toBe(200);
      // El filtro de tipo se aplica después de obtener los datos
      expect(response.body.ongs).toHaveLength(1);
    });

    it('debería manejar ONGs sin descripción', async () => {
      const mockOngs = [
        {
          id_usuario: 1,
          nombre: 'ONG Sin Bio',
          apellido: null,
          correo: 'sinbio@example.com',
          ubicacion: null,
          usuario: 'sinbio',
          createdAt: new Date(),
          bio: null
        }
      ];

      global.mockPrisma.usuario.findMany.mockResolvedValue(mockOngs);

      const response = await request(app).get('/api/ongs');

      expect(response.status).toBe(200);
      const ong = response.body.ongs[0];
      expect(ong.description).toBe('Sin descripción disponible');
      expect(ong.location).toBe('Ubicación no especificada');
    });

    it('debería manejar errores de base de datos', async () => {
      global.mockPrisma.usuario.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/ongs');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });

    it('debería retornar lista vacía si no hay ONGs', async () => {
      global.mockPrisma.usuario.findMany.mockResolvedValue([]);

      const response = await request(app).get('/api/ongs');

      expect(response.status).toBe(200);
      expect(response.body.ongs).toEqual([]);
    });
  });

  describe('GET /api/ongs/:id', () => {
    it('debería obtener una ONG específica por ID', async () => {
      const mockOng = {
        id_usuario: 1,
        nombre: 'ONG Específica',
        apellido: null,
        correo: 'especifica@example.com',
        ubicacion: 'Buenos Aires',
        usuario: 'especifica',
        createdAt: new Date(),
        bio: 'ONG específica para testing'
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockOng);

      const response = await request(app).get('/api/ongs/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ong');
      expect(response.body.ong.id).toBe(1);
      expect(response.body.ong.name).toBe('ONG Específica');

      expect(global.mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: {
          id_usuario: 1,
          tipo_usuario: 2
        },
        select: {
          id_usuario: true,
          nombre: true,
          apellido: true,
          correo: true,
          ubicacion: true,
          usuario: true,
          createdAt: true,
          bio: true
        }
      });
    });

    it('debería retornar 404 si la ONG no existe', async () => {
      global.mockPrisma.usuario.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/ongs/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('ONG no encontrada');
    });

    it('debería manejar IDs inválidos', async () => {
      global.mockPrisma.usuario.findUnique.mockRejectedValue(new Error('Invalid ID'));

      const response = await request(app).get('/api/ongs/invalid');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });

    it('debería usar nombre de usuario como fallback si no hay nombre', async () => {
      const mockOng = {
        id_usuario: 1,
        nombre: null,
        apellido: null,
        correo: 'usuario@example.com',
        ubicacion: 'Test',
        usuario: 'usuariotest',
        createdAt: new Date(),
        bio: null
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockOng);

      const response = await request(app).get('/api/ongs/1');

      expect(response.status).toBe(200);
      expect(response.body.ong.name).toBe('usuariotest');
    });

    it('debería generar datos simulados consistentemente', async () => {
      const mockOng = {
        id_usuario: 1,
        nombre: 'ONG Test',
        apellido: null,
        correo: 'test@example.com',
        ubicacion: 'Test Location',
        usuario: 'testong',
        createdAt: new Date(),
        bio: 'Test bio'
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockOng);

      const response = await request(app).get('/api/ongs/1');

      expect(response.status).toBe(200);
      const ong = response.body.ong;
      
      // Verificar que los datos simulados están presentes
      expect(typeof ong.volunteers_count).toBe('number');
      expect(typeof ong.projects_count).toBe('number');
      expect(ong.rating).toBe(4.5);
      expect(ong.website).toBe('https://testong.org');
      expect(ong.phone).toBe('+54 9 11 1234-5678');
    });
  });

  describe('Validación de datos', () => {
    it('debería manejar nombres con espacios', async () => {
      const mockOng = {
        id_usuario: 1,
        nombre: '  ONG con Espacios  ',
        apellido: null,
        correo: 'espacios@example.com',
        ubicacion: 'Test',
        usuario: 'espacios',
        createdAt: new Date(),
        bio: 'Test'
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockOng);

      const response = await request(app).get('/api/ongs/1');

      expect(response.status).toBe(200);
      expect(response.body.ong.name).toBe('  ONG con Espacios  '); // Preserva espacios
    });

    it('debería manejar ubicaciones con caracteres especiales', async () => {
      const mockOng = {
        id_usuario: 1,
        nombre: 'ONG Test',
        apellido: null,
        correo: 'test@example.com',
        ubicacion: 'São Paulo, Brasil - Área Metropolitana',
        usuario: 'test',
        createdAt: new Date(),
        bio: 'Test'
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockOng);

      const response = await request(app).get('/api/ongs/1');

      expect(response.status).toBe(200);
      expect(response.body.ong.location).toBe('São Paulo, Brasil - Área Metropolitana');
    });
  });
});