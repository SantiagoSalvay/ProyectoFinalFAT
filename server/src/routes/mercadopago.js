import express from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Configura tu access token de MercadoPago aquí
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-1234567890-abcdefghijklmnopqrstuvwxyz-12345678'
});

// Implementar la logica esta para el mercado pago

export default router;
