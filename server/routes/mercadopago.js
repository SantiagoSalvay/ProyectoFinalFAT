const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');

// Configura tu access token de MercadoPago aquí
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TU_ACCESS_TOKEN_AQUI'
});

// Endpoint para crear preferencia de pago
router.post('/create-preference', async (req, res) => {
  const { description, price, quantity } = req.body;
  try {
    const preference = {
      items: [
        {
          title: description,
          unit_price: Number(price),
          quantity: Number(quantity)
        }
      ]
    };
    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id, init_point: response.body.init_point });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear preferencia', details: error.message });
  }
});

module.exports = router;
