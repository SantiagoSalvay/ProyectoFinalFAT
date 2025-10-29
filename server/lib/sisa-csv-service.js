import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache para almacenar los datos del CSV en memoria
let sisaDataCache = [];
let lastLoadTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

/**
 * Normaliza un CUIT eliminando guiones y espacios
 */
export function normalizeCUIT(cuit) {
  if (!cuit) return '';
  return cuit.toString().replace(/[-\s]/g, '');
}

/**
 * Carga el CSV de SISA en memoria
 * Formato esperado: C�digo interno SISA;Nombre de la organizaci�n;CUIT;Provincia de domicilio;Domicilio completo;Tel�fono;Correo electr�nico
 */
export async function loadSisaCSV(csvPath) {
  try {
    console.log(`[SISA-CSV] Cargando archivo CSV: ${csvPath}`);
    
    const csvContent = fs.readFileSync(csvPath, 'latin1'); // Usar latin1 para manejar caracteres especiales
    const lines = csvContent.split('\n');
    
    const data = [];
    let headerLine = -1;
    
    // Buscar la línea de encabezados
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Código interno SISA') || lines[i].includes('C�digo interno SISA')) {
        headerLine = i;
        break;
      }
    }
    
    if (headerLine === -1) {
      throw new Error('No se encontró la línea de encabezados en el CSV');
    }
    
    console.log(`[SISA-CSV] Encabezados encontrados en línea ${headerLine + 1}`);
    
    // Procesar las líneas de datos (desde headerLine + 1)
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line || line.length === 0) continue; // Saltar líneas vacías
      
      const fields = line.split(';');
      
      if (fields.length >= 7) {
        const ong = {
          codigoInterno: fields[0]?.trim() || '',
          nombre: fields[1]?.trim() || '',
          cuit: normalizeCUIT(fields[2]?.trim() || ''),
          provinciaDomicilio: fields[3]?.trim() || '',
          domicilioCompleto: fields[4]?.trim() || '',
          telefono: fields[5]?.trim() || '',
          email: fields[6]?.trim() || ''
        };
        
        // Solo agregar si tiene CUIT válido
        if (ong.cuit && ong.cuit.length >= 11) {
          data.push(ong);
        }
      }
    }
    
    console.log(`[SISA-CSV] ✅ Cargadas ${data.length} ONGs del CSV`);
    
    sisaDataCache = data;
    lastLoadTime = Date.now();
    
    return data;
    
  } catch (error) {
    console.error('[SISA-CSV] ❌ Error al cargar CSV:', error);
    throw error;
  }
}

/**
 * Busca una ONG por CUIT en el CSV cargado
 */
export async function searchONGByCUIT(cuit, csvPath = null) {
  const normalizedCuit = normalizeCUIT(cuit);
  
  if (!normalizedCuit || normalizedCuit.length < 11) {
    return null;
  }
  
  // Verificar si necesitamos recargar el cache
  if (!sisaDataCache.length || !lastLoadTime || (Date.now() - lastLoadTime > CACHE_DURATION)) {
    if (csvPath && fs.existsSync(csvPath)) {
      await loadSisaCSV(csvPath);
    } else {
      console.warn('[SISA-CSV] ⚠️ No hay datos en cache y no se proporcionó ruta CSV');
      return null;
    }
  }
  
  // Buscar en el cache
  const found = sisaDataCache.find(ong => ong.cuit === normalizedCuit);
  
  if (found) {
    console.log(`[SISA-CSV] ✅ ONG encontrada: ${found.nombre} (CUIT: ${found.cuit})`);
    return found;
  } else {
    console.log(`[SISA-CSV] ❌ ONG no encontrada para CUIT: ${normalizedCuit}`);
    return null;
  }
}

/**
 * Obtiene todas las ONGs cargadas
 */
export function getAllONGs() {
  return sisaDataCache;
}

/**
 * Limpia el cache
 */
export function clearCache() {
  sisaDataCache = [];
  lastLoadTime = null;
  console.log('[SISA-CSV] Cache limpiado');
}

export default {
  loadSisaCSV,
  searchONGByCUIT,
  getAllONGs,
  clearCache,
  normalizeCUIT
};

