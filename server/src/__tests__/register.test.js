import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../index.js';

describe('User registration flow', () => {
  it('crea un RegistroPendiente al registrar un usuario y se guarda en la BD', async () => {
    // Usar un email único para evitar colisiones
    const unique = Date.now();
    const testEmail = `test.user.${unique}@example.com`;

    const payload = {
      nombre: 'Usuario Test',
      apellido: 'Apellido',
      correo: testEmail,
      contrasena: 'contrasenaSegura1',
      usuario: `testuser${unique}`,
      ubicacion: 'Test City',
      tipo_usuario: 1
    };

    // Hacer la petición de registro (la ruta de auth está montada en /auth)
    const res = await request(app).post('/auth/register').send(payload).set('Accept', 'application/json');

    // La ruta debería responder 200 en caso de registro exitoso (requiere verificación)
    if (res.status !== 200) {
      throw new Error(`Registro falló con status ${res.status}: ${JSON.stringify(res.body)}`);
    }

    expect(res.body).toHaveProperty('requiresVerification', true);

    // Verificar en la base de datos que existe el RegistroPendiente
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const registro = await prisma.RegistroPendiente.findFirst({ where: { correo: testEmail } });
      expect(registro).not.toBeNull();
      expect(registro).toHaveProperty('correo', testEmail);
      expect(registro).toHaveProperty('verification_token');
      expect(typeof registro.verification_token).toBe('string');

      // Cleanup: eliminar el registro pendiente creado por la prueba
      await prisma.RegistroPendiente.delete({ where: { id: registro.id } });
    } finally {
      await prisma.$disconnect();
    }
  }, 20000);
});
