import express from 'express';

const router = express.Router();

const BASE_URL = 'https://api.locationiq.com/v1';
const API_KEY = process.env.LOCATIONIQ_API_KEY || process.env.VITE_LOCATIONIQ_API_KEY;

router.get('/autocomplete', async (req, res) => {
  try {
    const { q, limit = '15', countrycodes = 'ar', dedupe = '0', addressdetails = '1', normalizeaddress = '1', viewbox, bounded = '0' } = req.query;

    if (!q || String(q).length < 3) {
      return res.status(400).json({ error: 'Parámetro q requerido (mínimo 3 caracteres)' });
    }
    if (!API_KEY) {
      return res.status(500).json({ error: 'LOCATIONIQ_API_KEY no configurado en servidor' });
    }

    const params = new URLSearchParams({
      key: API_KEY,
      q: String(q),
      limit: String(limit),
      countrycodes: String(countrycodes),
      dedupe: String(dedupe),
      addressdetails: String(addressdetails),
      normalizeaddress: String(normalizeaddress),
      bounded: String(bounded)
    });
    if (viewbox) params.set('viewbox', String(viewbox));

    const url = `${BASE_URL}/autocomplete?${params.toString()}`;
    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).send(text);
    }
    res.type('application/json').send(text);
  } catch (error) {
    res.status(502).json({ error: 'Error al consultar LocationIQ', message: error.message });
  }
});

router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon, format = 'json', addressdetails = '1' } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Parámetros lat y lon requeridos' });
    }
    if (!API_KEY) {
      return res.status(500).json({ error: 'LOCATIONIQ_API_KEY no configurado en servidor' });
    }

    const params = new URLSearchParams({
      key: API_KEY,
      lat: String(lat),
      lon: String(lon),
      format: String(format),
      addressdetails: String(addressdetails)
    });
    const url = `${BASE_URL}/reverse?${params.toString()}`;
    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).send(text);
    }
    res.type('application/json').send(text);
  } catch (error) {
    res.status(502).json({ error: 'Error al consultar LocationIQ', message: error.message });
  }
});

export default router;