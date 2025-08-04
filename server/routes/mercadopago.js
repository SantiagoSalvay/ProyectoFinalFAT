import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
const router = express.Router();

// Configura tu access token de MercadoPago aquí
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TU_ACCESS_TOKEN_AQUI'
});

// Endpoint para crear preferencia de pago
router.post('/create-preference', async (req, res) => {
  const { description, price, quantity } = req.body;
  try {
    const preference = new Preference(client);
    const result = await preference.create({
      items: [
        {
          title: description,
          unit_price: Number(price),
          quantity: Number(quantity)
        }
      ]
    });
    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear preferencia', details: error.message });
  }
});

export default router;
