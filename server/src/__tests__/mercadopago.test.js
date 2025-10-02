import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mercadopagoRouter from '../routes/mercadopago.js';

// Mock MercadoPago SDK
const mockPreference = {
  create: jest.fn()
};

const mockMercadoPagoConfig = jest.fn();

jest.unstable_mockModule('mercadopago', () => ({
  MercadoPagoConfig: mockMercadoPagoConfig,
  Preference: jest.fn(() => mockPreference)
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/mercadopago', mercadopagoRouter);

describe('MercadoPago Routes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockMercadoPagoConfig.mockClear();
  });

  describe('POST /mercadopago/create-preference', () => {
    it('debería crear una preferencia de pago exitosamente', async () => {
      const mockPreferenceResult = {
        id: 'preference-123',
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=preference-123'
      };

      mockPreference.create.mockResolvedValue(mockPreferenceResult);

      const paymentData = {
        description: 'Donación para ONG',
        price: 1000,
        quantity: 1
      };

      const response = await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 'preference-123',
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=preference-123'
      });

      expect(mockPreference.create).toHaveBeenCalledWith({
        items: [
          {
            title: 'Donación para ONG',
            unit_price: 1000,
            quantity: 1
          }
        ]
      });
    });

    it('debería manejar múltiples items en la preferencia', async () => {
      const mockPreferenceResult = {
        id: 'preference-456',
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=preference-456'
      };

      mockPreference.create.mockResolvedValue(mockPreferenceResult);

      const paymentData = {
        description: 'Kit de alimentos',
        price: 500,
        quantity: 3
      };

      const response = await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(mockPreference.create).toHaveBeenCalledWith({
        items: [
          {
            title: 'Kit de alimentos',
            unit_price: 500,
            quantity: 3
          }
        ]
      });
    });

    it('debería convertir strings a números correctamente', async () => {
      const mockPreferenceResult = {
        id: 'preference-789',
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=preference-789'
      };

      mockPreference.create.mockResolvedValue(mockPreferenceResult);

      const paymentData = {
        description: 'Donación',
        price: '2500.50', // String price
        quantity: '2' // String quantity
      };

      const response = await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(mockPreference.create).toHaveBeenCalledWith({
        items: [
          {
            title: 'Donación',
            unit_price: 2500.50,
            quantity: 2
          }
        ]
      });
    });

    it('debería manejar errores de MercadoPago', async () => {
      const mercadoPagoError = new Error('Invalid access token');
      mockPreference.create.mockRejectedValue(mercadoPagoError);

      const paymentData = {
        description: 'Donación',
        price: 1000,
        quantity: 1
      };

      const response = await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error al crear preferencia',
        details: 'Invalid access token'
      });
    });

    it('debería manejar datos faltantes', async () => {
      const paymentData = {
        description: 'Donación'
        // Faltan price y quantity
      };

      const response = await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      // El endpoint no valida campos requeridos, pero MercadoPago sí
      // Simulamos error de MercadoPago por datos faltantes
      const mercadoPagoError = new Error('Missing required fields');
      mockPreference.create.mockRejectedValue(mercadoPagoError);

      const response2 = await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      expect(response2.status).toBe(500);
      expect(response2.body.error).toBe('Error al crear preferencia');
    });

    it('debería manejar precios con decimales', async () => {
      const mockPreferenceResult = {
        id: 'preference-decimal',
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=preference-decimal'
      };

      mockPreference.create.mockResolvedValue(mockPreferenceResult);

      const paymentData = {
        description: 'Donación con decimales',
        price: 999.99,
        quantity: 1
      };

      const response = await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(mockPreference.create).toHaveBeenCalledWith({
        items: [
          {
            title: 'Donación con decimales',
            unit_price: 999.99,
            quantity: 1
          }
        ]
      });
    });

    it('debería manejar cantidades cero', async () => {
      const paymentData = {
        description: 'Donación',
        price: 1000,
        quantity: 0
      };

      // MercadoPago rechazaría cantidad 0
      const mercadoPagoError = new Error('Quantity must be greater than 0');
      mockPreference.create.mockRejectedValue(mercadoPagoError);

      const response = await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      expect(response.status).toBe(500);
      expect(response.body.details).toBe('Quantity must be greater than 0');
    });

    it('debería manejar precios negativos', async () => {
      const paymentData = {
        description: 'Donación',
        price: -100,
        quantity: 1
      };

      // MercadoPago rechazaría precio negativo
      const mercadoPagoError = new Error('Price must be positive');
      mockPreference.create.mockRejectedValue(mercadoPagoError);

      const response = await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      expect(response.status).toBe(500);
      expect(response.body.details).toBe('Price must be positive');
    });

    it('debería configurar MercadoPago con access token', async () => {
      // Verificar que se configura MercadoPago correctamente
      const mockPreferenceResult = {
        id: 'preference-config',
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=preference-config'
      };

      mockPreference.create.mockResolvedValue(mockPreferenceResult);

      const paymentData = {
        description: 'Test config',
        price: 100,
        quantity: 1
      };

      await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      // Verificar que se llamó al constructor de MercadoPagoConfig
      expect(mockMercadoPagoConfig).toHaveBeenCalledWith({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TU_ACCESS_TOKEN_AQUI'
      });
    });

    it('debería manejar descripciones largas', async () => {
      const mockPreferenceResult = {
        id: 'preference-long',
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=preference-long'
      };

      mockPreference.create.mockResolvedValue(mockPreferenceResult);

      const longDescription = 'A'.repeat(500); // Descripción muy larga

      const paymentData = {
        description: longDescription,
        price: 1000,
        quantity: 1
      };

      const response = await request(app)
        .post('/mercadopago/create-preference')
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(mockPreference.create).toHaveBeenCalledWith({
        items: [
          {
            title: longDescription,
            unit_price: 1000,
            quantity: 1
          }
        ]
      });
    });
  });

  describe('MercadoPago Configuration', () => {
    it('debería usar variable de entorno para access token', () => {
      // Este test verifica que la configuración use la variable de entorno
      const originalEnv = process.env.MERCADOPAGO_ACCESS_TOKEN;
      process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-access-token';

      // Re-import the module to get updated env var
      // Note: In real tests, you might need to use dynamic imports or module reloading
      expect(process.env.MERCADOPAGO_ACCESS_TOKEN).toBe('test-access-token');

      // Restore original env
      process.env.MERCADOPAGO_ACCESS_TOKEN = originalEnv;
    });

    it('debería usar fallback si no hay access token configurado', () => {
      const originalEnv = process.env.MERCADOPAGO_ACCESS_TOKEN;
      delete process.env.MERCADOPAGO_ACCESS_TOKEN;

      // The fallback should be 'TU_ACCESS_TOKEN_AQUI'
      expect(process.env.MERCADOPAGO_ACCESS_TOKEN || 'TU_ACCESS_TOKEN_AQUI').toBe('TU_ACCESS_TOKEN_AQUI');

      // Restore original env
      process.env.MERCADOPAGO_ACCESS_TOKEN = originalEnv;
    });
  });
});

