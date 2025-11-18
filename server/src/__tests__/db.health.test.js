import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
// Nota: este test usa la API /health/db para no crear un PrismaClient duplicado
import request from 'supertest';
import express from 'express';
import app from '../index.js';

describe('DB Health via /health/db', () => {
  it('responde ok cuando la DB está disponible', async () => {
    const res = await request(app).get('/health/db');
    // 200 ok o 500 detallado; validamos estructura
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toEqual({ ok: true });
    } else {
      expect(res.body).toHaveProperty('ok', false);
      expect(res.body).toHaveProperty('reason');
    }
  });

  it('la API /api/ongs devuelve ONGs desde la base de datos', async () => {
    const res = await request(app).get('/api/ongs');

    // Debe responder 200 o 500 (si hay problema interno)
    expect([200, 500]).toContain(res.status);

    if (res.status === 200) {
      // Se espera un objeto con la propiedad `ongs` que sea un array
      expect(res.body).toHaveProperty('ongs');
      expect(Array.isArray(res.body.ongs)).toBe(true);

      // Para que la página muestre ONGs debemos tener al menos una ONG en la BD.
      // Si no hay ONGs, este test fallará indicando que hay que seedear datos.
      expect(res.body.ongs.length).toBeGreaterThan(0);

      const first = res.body.ongs[0];
      // Verificar que la ONG contiene al menos identificador y nombre (nombres posibles según esquema)
      const hasId = ['id', 'id_usuario', 'usuarioId', 'usuario'].some(k => Object.prototype.hasOwnProperty.call(first, k));
      const hasName = ['nombre', 'name', 'razon_social'].some(k => Object.prototype.hasOwnProperty.call(first, k));
      expect(hasId).toBe(true);
      expect(hasName).toBe(true);
    } else {
      // Si el endpoint falló, fallamos con mensaje claro
      throw new Error('Endpoint /api/ongs respondió con error: ' + JSON.stringify(res.body));
    }
  });

  it('todas las ONGs en la base de datos se cargan en /api/ongs', async () => {
    // Importar Prisma dinámicamente aquí para evitar crear el cliente durante el require inicial
    const { PrismaClient } = await import('@prisma/client');
    const prismaTest = new PrismaClient();
    try {
      // Contar ONGs directamente en la base de datos
      const dbCount = await prismaTest.Usuario.count({ where: { id_tipo_usuario: 2 } });

      const res = await request(app).get('/api/ongs');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ongs');
      expect(Array.isArray(res.body.ongs)).toBe(true);

      const apiCount = res.body.ongs.length;

      // Comparar: esperamos que la API devuelva exactamente la misma cantidad que hay en la DB
      expect(apiCount).toBe(dbCount);
    } finally {
      // Desconectar el cliente de Prisma creado para este test
      await prismaTest.$disconnect();
    }
  });
});



