import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { decryptSecret } from '../../lib/encryption-service.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const router = express.Router();
const prisma = new PrismaClient();

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    req.user = { id_usuario: decoded.userId };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

router.post('/mp/create', auth, async (req, res) => {
  try {
    const { ongId, description, amount, quantity = 1 } = req.body || {};
    if (!ongId || amount === undefined || amount === null || !description) {
      return res.status(400).json({ error: 'ongId, amount y description son requeridos' });
    }
    const qty = Number.isFinite(Number(quantity)) ? parseInt(quantity, 10) : 1;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: 'amount debe ser un número mayor a 0' });
    }

    const ongUser = await prisma.Usuario.findUnique({
      where: { id_usuario: parseInt(ongId) },
      select: { id_usuario: true, id_tipo_usuario: true, DetalleUsuario: true }
    });

    if (!ongUser || ongUser.id_tipo_usuario !== 2) {
      return res.status(404).json({ error: 'ONG no válida' });
    }

    const detalle = await prisma.DetalleUsuario.findUnique({
      where: { id_usuario: parseInt(ongId) },
      select: { mp_enabled: true, mp_token_cipher: true, mp_token_iv: true, mp_token_tag: true }
    });

    if (!detalle || !detalle.mp_enabled || !detalle.mp_token_cipher) {
      return res.status(400).json({ error: 'La ONG no está habilitada para recibir donaciones monetarias' });
    }

    const accessToken = decryptSecret({
      cipher: detalle.mp_token_cipher,
      iv: detalle.mp_token_iv,
      tag: detalle.mp_token_tag
    });

    const mpClient = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(mpClient);

    const baseUrl = process.env.FRONTEND_BASE_URL || req.headers.origin || 'http://localhost:3000';
    const successUrl = process.env.MP_SUCCESS_URL || `${baseUrl}/donaciones/exito`;
    const failureUrl = process.env.MP_FAILURE_URL || `${baseUrl}/donaciones/error`;
    const pendingUrl = process.env.MP_PENDING_URL || `${baseUrl}/donaciones/pendiente`;

    const body = {
      items: [
        {
          title: description,
          unit_price: amt,
          quantity: qty,
          currency_id: 'ARS'
        }
      ],
      metadata: {
        ongId: String(ongId),
        donorId: String(req.user.id_usuario)
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
      }
    };

    // auto_return requiere back_urls.success válido
    if (successUrl && typeof successUrl === 'string' && /^https?:\/\//.test(successUrl)) {
      body.auto_return = 'approved';
    }

    const prefResult = await preference.create({ body });

    return res.json({ id: prefResult.id, init_point: prefResult.init_point });
  } catch (error) {
    console.error('Error creando preferencia MP:', error);
    res.status(500).json({ error: 'Error creando preferencia', details: error.message });
  }
});

export default router;
