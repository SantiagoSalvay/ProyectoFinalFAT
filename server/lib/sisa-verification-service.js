import puppeteer from 'puppeteer';

/**
 * Servicio de verificación de ONGs en SISA
 * (Sistema de Información Sanitaria Argentino - Registro Nacional de Organizaciones de la Sociedad Civil)
 * 
 * Este servicio consulta el registro SISA para verificar ONGs relacionadas con salud.
 * Es más confiable que IPJ y tiene datos estructurados.
 */

const SISA_URL = 'https://sisa.msal.gov.ar/sisa/';

/**
 * Normaliza el CUIT removiendo guiones y espacios
 * @param {string} cuit 
 * @returns {string}
 */
function normalizeCUIT(cuit) {
  if (!cuit) return '';
  return cuit.replace(/[-\s]/g, '');
}

/**
 * Verifica si una ONG existe en el registro SISA
 * 
 * @param {Object} ongData - Datos de la ONG a verificar
 * @param {string} ongData.cuit - CUIT de la organización (requerido)
 * @param {string} ongData.denominacion - Nombre de la organización (opcional)
 * 
 * @returns {Promise<Object>} Resultado de la verificación
 * {
 *   verified: boolean,
 *   found: boolean,
 *   data: {
 *     codigoInterno: string,
 *     cuit: string,
 *     provinciaDomicilio: string,
 *     domicilioCompleto: string,
 *     telefono: string,
 *     email: string,
 *     sitioWeb: string,
 *     nroRegistro: string,
 *     expediente: string
 *   },
 *   error: string
 * }
 */
export async function verifyONGWithSISA(ongData) {
  let browser;
  
  try {
    console.log('🔍 [SISA] Iniciando verificación de ONG:', {
      cuit: ongData.cuit,
      denominacion: ongData.denominacion
    });

    // Validar CUIT (obligatorio en SISA)
    if (!ongData.cuit) {
      return {
        verified: false,
        found: false,
        error: 'El CUIT es requerido para buscar en SISA'
      };
    }

    const cuitNormalizado = normalizeCUIT(ongData.cuit);

    // Lanzar navegador
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Configurar timeout
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);

    console.log('🌐 [SISA] Navegando al portal SISA...');
    await page.goto(SISA_URL, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Función helper para hacer click por texto
    const clickElementByText = async (text, selectors = 'a, button') => {
      return await page.evaluate((searchText, selectorList) => {
        const elements = document.querySelectorAll(selectorList);
        for (const element of elements) {
          if (element.textContent.includes(searchText)) {
            element.click();
            return true;
          }
        }
        return false;
      }, text, selectors);
    };

    // Paso 1: Buscar enlace al Registro de ONGs
    console.log('📋 [SISA] Buscando registro de organizaciones...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const registroClicked = await clickElementByText('Organizaciones de la Sociedad Civil', 'a, button, div');
    if (registroClicked) {
      console.log('✅ [SISA] Click en Organizaciones de la Sociedad Civil');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.warn('⚠️ [SISA] No se encontró el enlace al registro');
    }

    // Paso 2: Buscar formulario de consulta
    console.log('🔎 [SISA] Buscando formulario de búsqueda...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Buscar campos de búsqueda
    let cuitFields = await page.$$('input[name*="cuit" i], input[id*="cuit" i], input[placeholder*="cuit" i]');
    
    if (cuitFields.length === 0) {
      // Buscar campos de texto genéricos
      cuitFields = await page.$$('input[type="text"]');
    }

    if (cuitFields.length === 0) {
      console.warn('⚠️ [SISA] No se encontró campo de CUIT');
      return {
        verified: false,
        found: false,
        error: 'No se pudo acceder al formulario de búsqueda de SISA'
      };
    }

    console.log(`✅ [SISA] Encontrados ${cuitFields.length} campos de búsqueda`);

    // Paso 3: Ingresar CUIT
    console.log(`📝 [SISA] Ingresando CUIT: ${cuitNormalizado}`);
    
    try {
      // Intentar en el primer campo que parezca ser para CUIT
      for (const field of cuitFields) {
        try {
          const fieldInfo = await page.evaluate(el => ({
            name: el.name || '',
            id: el.id || '',
            placeholder: el.placeholder || ''
          }), field);

          // Priorizar campos que mencionen CUIT
          if (fieldInfo.name.toLowerCase().includes('cuit') || 
              fieldInfo.id.toLowerCase().includes('cuit') ||
              fieldInfo.placeholder.toLowerCase().includes('cuit')) {
            await field.click({ clickCount: 3 });
            await new Promise(resolve => setTimeout(resolve, 200));
            await field.type(cuitNormalizado, { delay: 50 });
            console.log('✅ [SISA] CUIT ingresado en campo específico');
            break;
          }
        } catch (err) {
          // Continuar con el siguiente campo
        }
      }
      
      // Si no se encontró campo específico, usar el primero
      if (cuitFields.length > 0) {
        try {
          await cuitFields[0].click({ clickCount: 3 });
          await new Promise(resolve => setTimeout(resolve, 200));
          await cuitFields[0].type(cuitNormalizado, { delay: 50 });
          console.log('✅ [SISA] CUIT ingresado en primer campo');
        } catch (err) {
          console.warn('⚠️ [SISA] Error al ingresar CUIT:', err.message);
        }
      }
    } catch (typeError) {
      console.warn('⚠️ [SISA] Error al ingresar CUIT:', typeError.message);
    }

    // Paso 4: Buscar y hacer click en botón de búsqueda
    await new Promise(resolve => setTimeout(resolve, 1000));

    const searchButtons = await page.$$('button, input[type="submit"], input[type="button"]');
    let searchButtonClicked = false;

    console.log(`🔍 [SISA] Encontrados ${searchButtons.length} botones`);

    for (const button of searchButtons) {
      try {
        const buttonInfo = await page.evaluate(el => ({
          text: (el.textContent || el.value || '').toLowerCase(),
          visible: el.offsetParent !== null
        }), button);

        if (buttonInfo.visible && /buscar|search|consultar|filtrar/i.test(buttonInfo.text)) {
          await button.click();
          searchButtonClicked = true;
          console.log(`✅ [SISA] Click en botón: "${buttonInfo.text}"`);
          break;
        }
      } catch (err) {
        // Continuar
      }
    }

    if (!searchButtonClicked && searchButtons.length > 0) {
      try {
        await searchButtons[searchButtons.length - 1].click();
        console.log('✅ [SISA] Click en botón (fallback)');
      } catch (err) {
        console.warn('⚠️ [SISA] No se pudo hacer click en botón');
      }
    }

    // Paso 5: Esperar y extraer resultados
    console.log('⏳ [SISA] Esperando resultados...');
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Extraer datos de la tabla
    console.log('📊 [SISA] Extrayendo datos...');
    
    const resultados = await page.evaluate((searchCuit) => {
      // Buscar tabla con los resultados
      const tables = Array.from(document.querySelectorAll('table'));
      
      for (const table of tables) {
        const rows = Array.from(table.querySelectorAll('tr'));
        
        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll('td'));
          
          // Buscar fila que contenga el CUIT buscado
          const cuitCell = cells.find(cell => 
            cell.textContent.replace(/[-\s]/g, '').includes(searchCuit)
          );
          
          if (cuitCell && cells.length >= 5) {
            // Estructura típica de SISA basada en tu captura:
            // [Código Interno, CUIT, Provincia, Domicilio, Teléfono, Email, Sitio web, Nro. registro, Expediente]
            return {
              found: true,
              codigoInterno: cells[0]?.textContent.trim() || '',
              cuit: cells[1]?.textContent.trim() || '',
              provinciaDomicilio: cells[2]?.textContent.trim() || '',
              domicilioCompleto: cells[3]?.textContent.trim() || '',
              telefono: cells[4]?.textContent.trim() || '',
              email: cells[5]?.textContent.trim() || '',
              sitioWeb: cells[6]?.textContent.trim() || '',
              nroRegistro: cells[7]?.textContent.trim() || '',
              expediente: cells[8]?.textContent.trim() || ''
            };
          }
        }
      }
      
      return { found: false };
    }, cuitNormalizado);

    if (resultados.found) {
      console.log('✅ [SISA] ONG encontrada en el registro');
      console.log('📋 [SISA] Datos:', resultados);
      
      return {
        verified: true,
        found: true,
        data: {
          codigoInterno: resultados.codigoInterno,
          cuit: resultados.cuit,
          provinciaDomicilio: resultados.provinciaDomicilio,
          domicilioCompleto: resultados.domicilioCompleto,
          telefono: resultados.telefono,
          email: resultados.email,
          sitioWeb: resultados.sitioWeb,
          nroRegistro: resultados.nroRegistro,
          expediente: resultados.expediente
        },
        error: null
      };
    } else {
      console.log('❌ [SISA] ONG no encontrada en el registro');
      
      // Verificar si hay mensaje de "no encontrado"
      const pageText = await page.evaluate(() => document.body.innerText);
      const noResultados = /no se encontr|sin resultados|no existe|no hay registros/i.test(pageText);
      
      return {
        verified: false,
        found: false,
        data: null,
        error: noResultados 
          ? 'La organización no fue encontrada en el registro SISA'
          : 'No se pudieron obtener resultados claros de SISA'
      };
    }

  } catch (error) {
    console.error('❌ [SISA] Error durante la verificación:', error);
    return {
      verified: false,
      found: false,
      error: `Error al consultar SISA: ${error.message}`
    };
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 [SISA] Navegador cerrado');
    }
  }
}

/**
 * Valida los datos de la ONG contra los datos obtenidos de SISA
 * @param {Object} submittedData - Datos enviados por el usuario
 * @param {Object} sisaData - Datos obtenidos de SISA
 * @returns {Object} Resultado de la validación
 */
export function validateONGDataWithSISA(submittedData, sisaData) {
  if (!sisaData) return { valid: false, errors: ['No hay datos de SISA'] };

  const errors = [];
  const warnings = [];

  // Validar CUIT (más estricto)
  if (submittedData.cuit && sisaData.cuit) {
    const cuit1 = normalizeCUIT(submittedData.cuit);
    const cuit2 = normalizeCUIT(sisaData.cuit);
    if (cuit1 !== cuit2) {
      errors.push('El CUIT no coincide con el registrado en SISA');
    }
  }

  // Validar email (advertencia si no coincide)
  if (submittedData.email && sisaData.email) {
    if (submittedData.email.toLowerCase() !== sisaData.email.toLowerCase()) {
      warnings.push('El email difiere del registrado en SISA');
    }
  }

  // Validar ubicación (advertencia si la provincia no coincide)
  if (submittedData.ubicacion && sisaData.provinciaDomicilio) {
    const ubicacionLower = submittedData.ubicacion.toLowerCase();
    const provinciaLower = sisaData.provinciaDomicilio.toLowerCase();
    
    if (!ubicacionLower.includes(provinciaLower) && !provinciaLower.includes(ubicacionLower)) {
      warnings.push(`La ubicación proporcionada no coincide con SISA (${sisaData.provinciaDomicilio})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  verifyONGWithSISA,
  validateONGDataWithSISA
};

