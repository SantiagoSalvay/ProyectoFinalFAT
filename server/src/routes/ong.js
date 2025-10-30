import express from 'express';
import { searchONGByCUIT, loadSisaCSV } from '../../lib/sisa-csv-service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al CSV de SISA (ajustar según donde lo guardes)
const SISA_CSV_PATH = path.join(__dirname, '../../data/listado_sisa.csv');

/**
 * GET /api/ong/search-by-cuit?cuit=XXXXX
 * Busca una ONG por CUIT en el registro SISA
 */
router.get('/search-by-cuit', async (req, res) => {
  try {
    const { cuit } = req.query;
    
    if (!cuit) {
      return res.status(400).json({ error: 'El CUIT es requerido' });
    }
    
    console.log(`[ONG-API] Buscando ONG con CUIT: ${cuit}`);
    
    const ongData = await searchONGByCUIT(cuit, SISA_CSV_PATH);
    
    if (ongData) {
      return res.status(200).json(ongData);
    } else {
      return res.status(404).json({ 
        error: 'ONG no encontrada en el registro SISA',
        message: 'La organización no fue encontrada en el registro nacional de OSC'
      });
    }
    
  } catch (error) {
    console.error('[ONG-API] Error al buscar ONG:', error);
    return res.status(500).json({ 
      error: 'Error al buscar la organización',
      message: error.message 
    });
  }
});

/**
 * POST /api/ong/reload-csv
 * Recarga el CSV de SISA (útil para actualizar datos)
 */
router.post('/reload-csv', async (req, res) => {
  try {
    console.log('[ONG-API] Recargando CSV de SISA...');
    
    await loadSisaCSV(SISA_CSV_PATH);
    
    return res.status(200).json({ 
      message: 'CSV de SISA recargado exitosamente' 
    });
    
  } catch (error) {
    console.error('[ONG-API] Error al recargar CSV:', error);
    return res.status(500).json({ 
      error: 'Error al recargar CSV',
      message: error.message 
    });
  }
});

export default router;

