import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import forumRouter from '../routes/forum.js';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/forum', forumRouter);

describe('Forum Routes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /forum/categorias', () => {
    it('debería obtener todas las categorías ordenadas alfabéticamente', async () => {
      const mockCategorias = [
        { id_categoria: 1, etiqueta: 'Alimentación' },
        { id_categoria: 2, etiqueta: 'Educación' },
        { id_categoria: 3, etiqueta: 'Salud' }
      ];

      global.mockPrisma.categoria.findMany.mockResolvedValue(mockCategorias);

      const response = await request(app)
        .get('/forum/categorias');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategorias);
      expect(global.mockPrisma.categoria.findMany).toHaveBeenCalledWith({
        orderBy: {
          etiqueta: 'asc'
        }
      });
    });

    it('debería manejar errores al obtener categorías', async () => {
      global.mockPrisma.categoria.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/forum/categorias');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });

  describe('GET /forum/publicaciones', () => {
    it('debería obtener todas las publicaciones formateadas', async () => {
      const mockPublicaciones = [
        {
          id_foro: 1,
          titulo: 'Ayuda con alimentos',
          descripcion: 'Necesitamos donaciones de alimentos',
          fecha: new Date('2024-01-01'),
          ubicacion: 'Buenos Aires',
          usuario: {
            id_usuario: 1,
            nombre: 'ONG',
            apellido: 'Solidaria',
            tipo_usuario: 2,
            ubicacion: 'Buenos Aires'
          },
          foroCategorias: [
            {
              categoria: {
                etiqueta: 'Alimentación'
              }
            }
          ],
          respuestas: [
            { id_respuesta: 1 },
            { id_respuesta: 2 }
          ]
        }
      ];

      global.mockPrisma.foro.findMany.mockResolvedValue(mockPublicaciones);

      const response = await request(app)
        .get('/forum/publicaciones');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      
      const publicacion = response.body[0];
      expect(publicacion).toHaveProperty('id', '1');
      expect(publicacion).toHaveProperty('title', 'Ayuda con alimentos');
      expect(publicacion).toHaveProperty('content', 'Necesitamos donaciones de alimentos');
      expect(publicacion.author).toHaveProperty('role', 'ong');
      expect(publicacion).toHaveProperty('tags', ['Alimentación']);
      expect(publicacion).toHaveProperty('comments', 2);
    });

    it('debería manejar ubicación en formato JSON', async () => {
      const mockPublicaciones = [
        {
          id_foro: 1,
          titulo: 'Test',
          descripcion: 'Test description',
          fecha: new Date(),
          ubicacion: '{"address": "Córdoba, Argentina", "coordinates": [-64.1810, -31.4201]}',
          usuario: {
            id_usuario: 1,
            nombre: 'Test',
            apellido: 'User',
            tipo_usuario: 1
          },
          foroCategorias: [],
          respuestas: []
        }
      ];

      global.mockPrisma.foro.findMany.mockResolvedValue(mockPublicaciones);

      const response = await request(app)
        .get('/forum/publicaciones');

      expect(response.status).toBe(200);
      expect(response.body[0].location).toBe('Córdoba, Argentina');
    });

    it('debería manejar errores al obtener publicaciones', async () => {
      global.mockPrisma.foro.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/forum/publicaciones');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });

  describe('POST /forum/publicaciones', () => {
    it('debería crear una nueva publicación exitosamente (ONG)', async () => {
      const mockUser = {
        id_usuario: 1,
        tipo_usuario: 2 // ONG
      };

      const mockNuevaPublicacion = {
        id_foro: 1,
        id_usuario: 1,
        titulo: 'Nueva publicación',
        descripcion: 'Descripción de la publicación',
        fecha: new Date(),
        ubicacion: 'Buenos Aires'
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);
      global.mockPrisma.foro.create.mockResolvedValue(mockNuevaPublicacion);
      global.mockPrisma.foroCategoria.create.mockResolvedValue({});

      const publicacionData = {
        titulo: 'Nueva publicación',
        descripcion: 'Descripción de la publicación',
        categorias: [1, 2],
        ubicacion: 'Buenos Aires'
      };

      const response = await request(app)
        .post('/forum/publicaciones')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(publicacionData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Publicación creada exitosamente');
      expect(response.body).toHaveProperty('id', 1);
      expect(global.mockPrisma.foro.create).toHaveBeenCalled();
      expect(global.mockPrisma.foroCategoria.create).toHaveBeenCalledTimes(2);
    });

    it('debería crear publicación con coordenadas', async () => {
      const mockUser = {
        id_usuario: 1,
        tipo_usuario: 2
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);
      global.mockPrisma.foro.create.mockResolvedValue({
        id_foro: 1,
        ubicacion: '{"address":"Buenos Aires","coordinates":[-58.3816,-34.6037]}'
      });

      const publicacionData = {
        titulo: 'Publicación con coordenadas',
        descripcion: 'Descripción',
        ubicacion: 'Buenos Aires',
        coordenadas: [-58.3816, -34.6037],
        categorias: []
      };

      const response = await request(app)
        .post('/forum/publicaciones')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(publicacionData);

      expect(response.status).toBe(201);
      expect(global.mockPrisma.foro.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ubicacion: '{"address":"Buenos Aires","coordinates":[-58.3816,-34.6037]}'
        })
      });
    });

    it('debería fallar si el usuario no es ONG', async () => {
      const mockUser = {
        id_usuario: 1,
        tipo_usuario: 1 // Persona, no ONG
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      const publicacionData = {
        titulo: 'Nueva publicación',
        descripcion: 'Descripción'
      };

      const response = await request(app)
        .post('/forum/publicaciones')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(publicacionData);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Solo las ONGs pueden crear publicaciones');
    });

    it('debería fallar sin token de autorización', async () => {
      const publicacionData = {
        titulo: 'Nueva publicación',
        descripcion: 'Descripción'
      };

      const response = await request(app)
        .post('/forum/publicaciones')
        .send(publicacionData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No autorizado');
    });

    it('debería manejar errores de base de datos', async () => {
      const mockUser = {
        id_usuario: 1,
        tipo_usuario: 2
      };

      global.mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);
      global.mockPrisma.foro.create.mockRejectedValue(new Error('Database error'));

      const publicacionData = {
        titulo: 'Nueva publicación',
        descripcion: 'Descripción'
      };

      const response = await request(app)
        .post('/forum/publicaciones')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(publicacionData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });

  describe('GET /forum/publicaciones/:id', () => {
    it('debería obtener una publicación específica con respuestas', async () => {
      const mockPublicacion = {
        id_foro: 1,
        titulo: 'Publicación específica',
        descripcion: 'Descripción detallada',
        fecha: new Date(),
        ubicacion: 'Buenos Aires',
        usuario: {
          id_usuario: 1,
          nombre: 'ONG',
          apellido: 'Test',
          tipo_usuario: 2
        },
        foroCategorias: [
          {
            categoria: {
              etiqueta: 'Salud'
            }
          }
        ],
        respuestas: [
          {
            id_respuesta: 1,
            contenido: 'Primera respuesta',
            fecha: new Date(),
            usuario: {
              id_usuario: 2,
              nombre: 'Usuario',
              apellido: 'Respuesta',
              tipo_usuario: 1
            }
          }
        ]
      };

      global.mockPrisma.foro.findUnique.mockResolvedValue(mockPublicacion);

      const response = await request(app)
        .get('/forum/publicaciones/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPublicacion);
      expect(global.mockPrisma.foro.findUnique).toHaveBeenCalledWith({
        where: { id_foro: 1 },
        include: expect.objectContaining({
          usuario: expect.any(Object),
          foroCategorias: expect.any(Object),
          respuestas: expect.any(Object)
        })
      });
    });

    it('debería retornar 404 si la publicación no existe', async () => {
      global.mockPrisma.foro.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/forum/publicaciones/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Publicación no encontrada');
    });

    it('debería manejar errores al obtener publicación específica', async () => {
      global.mockPrisma.foro.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/forum/publicaciones/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });

    it('debería manejar IDs inválidos', async () => {
      global.mockPrisma.foro.findUnique.mockRejectedValue(new Error('Invalid ID'));

      const response = await request(app)
        .get('/forum/publicaciones/invalid');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });
});
