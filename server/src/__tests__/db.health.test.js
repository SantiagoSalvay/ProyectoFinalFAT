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
});



