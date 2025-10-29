/**
 * Script de Debug para el Scraper de SISA
 * (Sistema de Información Sanitaria Argentino)
 * 
 * Uso:
 * node scripts/debug-sisa-scraper.js [CUIT]
 * 
 * Ejemplo:
 * node scripts/debug-sisa-scraper.js 30718204530
 */

import puppeteer from 'puppeteer';

const SISA_URL = 'https://sisa.msal.gov.ar/sisa/';
const CUIT_PRUEBA = process.argv[2] || '30718204530'; // CUIT del ejemplo

async function debugSISA() {
  console.log('🔍 Iniciando debug del scraper SISA...\n');
  console.log(`📝 CUIT a buscar: ${CUIT_PRUEBA}\n`);
  
  const browser = await puppeteer.launch({
    headless: false, // Ver el navegador
    slowMo: 100,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('🌐 Navegando a:', SISA_URL);
  await page.goto(SISA_URL, { waitUntil: 'networkidle2' });
  
  console.log('✅ Página cargada\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ========================================
  // ANÁLISIS 1: Estructura de la página
  // ========================================
  console.log('📋 ANÁLISIS 1: Enlaces y menús principales');
  console.log('='.repeat(60));
  
  const enlaces = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    return links
      .filter(el => el.textContent.trim().length > 0 && el.textContent.trim().length < 100)
      .map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim(),
        href: el.href || 'N/A'
      }))
      .slice(0, 30);
  });

  enlaces.forEach((link, i) => {
    console.log(`${i + 1}. [${link.tag.toUpperCase()}] "${link.text}"`);
    if (link.href !== 'N/A') console.log(`   → ${link.href}`);
  });

  console.log('\n' + '='.repeat(60));

  // ========================================
  // ANÁLISIS 2: Buscar sección de ONGs
  // ========================================
  console.log('\n📋 ANÁLISIS 2: Búsqueda de sección de Organizaciones');
  console.log('='.repeat(60));

  const terminos = [
    'Organizaciones de la Sociedad Civil',
    'Organizaciones',
    'Sociedad Civil',
    'Registro',
    'Consulta'
  ];

  for (const termino of terminos) {
    const encontrado = await page.evaluate((term) => {
      const elements = Array.from(document.querySelectorAll('*'));
      const matches = elements.filter(el => 
        el.textContent.includes(term) && 
        el.textContent.trim().length < 200
      );
      return matches.map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim().substring(0, 80)
      })).slice(0, 3);
    }, termino);

    if (encontrado.length > 0) {
      console.log(`\n✅ "${termino}" encontrado:`);
      encontrado.forEach(match => {
        console.log(`   - [${match.tag}] "${match.text}"`);
      });
    } else {
      console.log(`\n❌ "${termino}" NO encontrado`);
    }
  }

  console.log('\n' + '='.repeat(60));

  // ========================================
  // INTERACCIÓN: Intentar navegar
  // ========================================
  console.log('\n📋 ANÁLISIS 3: Intentando navegar a la sección de ONGs');
  console.log('='.repeat(60));

  const clickElementByText = async (text) => {
    return await page.evaluate((searchText) => {
      const elements = document.querySelectorAll('a, button, div[onclick]');
      for (const element of elements) {
        if (element.textContent.includes(searchText)) {
          element.click();
          return true;
        }
      }
      return false;
    }, text);
  };

  const clicked = await clickElementByText('Organizaciones de la Sociedad Civil');
  
  if (clicked) {
    console.log('✅ Click exitoso en "Organizaciones de la Sociedad Civil"');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Tomar screenshot
    await page.screenshot({ path: 'debug-sisa-ongs-page.png' });
    console.log('📸 Screenshot guardado: debug-sisa-ongs-page.png');
  } else {
    console.log('❌ No se pudo hacer click, probando alternativas...');
    
    const alternativas = ['Organizaciones', 'Sociedad Civil', 'Registro'];
    for (const alt of alternativas) {
      const altClicked = await clickElementByText(alt);
      if (altClicked) {
        console.log(`✅ Click exitoso en "${alt}"`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        break;
      }
    }
  }

  // ========================================
  // ANÁLISIS 4: Campos de formulario
  // ========================================
  console.log('\n📋 ANÁLISIS 4: Campos de formulario disponibles');
  console.log('='.repeat(60));

  const inputs = await page.evaluate(() => {
    const fields = Array.from(document.querySelectorAll('input, select'));
    return fields.map(field => ({
      tag: field.tagName.toLowerCase(),
      type: field.type || 'N/A',
      name: field.name || 'N/A',
      id: field.id || 'N/A',
      placeholder: field.placeholder || 'N/A',
      value: field.value || '',
      visible: field.offsetParent !== null
    }));
  });

  if (inputs.length > 0) {
    console.log(`\n✅ Encontrados ${inputs.length} campos:`);
    inputs.forEach((input, i) => {
      if (input.visible) {
        console.log(`\n${i + 1}. [${input.tag.toUpperCase()}] Visible ✅`);
        console.log(`   Type: ${input.type}`);
        console.log(`   ID: ${input.id}`);
        console.log(`   Name: ${input.name}`);
        if (input.placeholder !== 'N/A') console.log(`   Placeholder: ${input.placeholder}`);
      }
    });
  } else {
    console.log('❌ No se encontraron campos de formulario');
  }

  console.log('\n' + '='.repeat(60));

  // ========================================
  // ANÁLISIS 5: Tablas en la página
  // ========================================
  console.log('\n📋 ANÁLISIS 5: Tablas de resultados');
  console.log('='.repeat(60));

  const tablas = await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table'));
    return tables.map((table, index) => {
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
      const rowCount = table.querySelectorAll('tr').length;
      return {
        index,
        headers,
        rowCount,
        visible: table.offsetParent !== null
      };
    });
  });

  if (tablas.length > 0) {
    console.log(`\n✅ Encontradas ${tablas.length} tablas:`);
    tablas.forEach(tabla => {
      if (tabla.visible && tabla.rowCount > 0) {
        console.log(`\nTabla ${tabla.index + 1}: ${tabla.rowCount} filas`);
        console.log(`Columnas: ${tabla.headers.join(' | ')}`);
      }
    });
  } else {
    console.log('❌ No se encontraron tablas en esta página');
  }

  console.log('\n' + '='.repeat(60));

  // ========================================
  // TEST: Intentar buscar el CUIT
  // ========================================
  console.log('\n📋 TEST: Intentando buscar CUIT');
  console.log('='.repeat(60));

  const cuitFields = await page.$$('input');
  if (cuitFields.length > 0) {
    console.log(`\n✅ Encontrados ${cuitFields.length} campos input`);
    console.log(`📝 Intentando ingresar CUIT: ${CUIT_PRUEBA}...`);
    
    try {
      const firstField = cuitFields[0];
      await firstField.click({ clickCount: 3 });
      await new Promise(resolve => setTimeout(resolve, 500));
      await firstField.type(CUIT_PRUEBA, { delay: 100 });
      console.log('✅ CUIT ingresado exitosamente');
      
      // Buscar botón de búsqueda
      await new Promise(resolve => setTimeout(resolve, 500));
      const buttons = await page.$$('button, input[type="submit"]');
      
      if (buttons.length > 0) {
        console.log(`\n🔍 Encontrados ${buttons.length} botones, haciendo click en el primero...`);
        await buttons[0].click();
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Tomar screenshot del resultado
        await page.screenshot({ path: 'debug-sisa-resultado.png', fullPage: true });
        console.log('📸 Screenshot del resultado: debug-sisa-resultado.png');
        
        // Extraer contenido de la tabla si existe
        const resultados = await page.evaluate(() => {
          const tables = Array.from(document.querySelectorAll('table'));
          if (tables.length === 0) return { found: false };
          
          const firstTable = tables[0];
          const rows = Array.from(firstTable.querySelectorAll('tr'));
          
          return {
            found: true,
            rowCount: rows.length,
            sample: rows.slice(0, 3).map(row => {
              const cells = Array.from(row.querySelectorAll('td, th'));
              return cells.map(cell => cell.textContent.trim());
            })
          };
        });
        
        if (resultados.found) {
          console.log('\n✅ Tabla de resultados encontrada!');
          console.log(`Filas: ${resultados.rowCount}`);
          console.log('\nPrimeras filas:');
          resultados.sample.forEach((row, i) => {
            console.log(`\nFila ${i + 1}: ${row.join(' | ')}`);
          });
        } else {
          console.log('\n⚠️ No se encontró tabla de resultados');
        }
      }
    } catch (err) {
      console.error('❌ Error en el test:', err.message);
    }
  }

  console.log('\n' + '='.repeat(60));

  // ========================================
  // RECOMENDACIONES
  // ========================================
  console.log('\n💡 RECOMENDACIONES');
  console.log('='.repeat(60));
  console.log(`
1. Revisa los screenshots generados:
   - debug-sisa-ongs-page.png (página de ONGs)
   - debug-sisa-resultado.png (resultado de búsqueda)

2. Si encontró la tabla de resultados:
   - Verifica el orden de las columnas
   - Actualiza los índices en sisa-verification-service.js

3. Si NO encontró resultados:
   - El CUIT puede no estar en el registro
   - Prueba con otro CUIT conocido
   - Revisa manualmente en SISA

4. Estructura de la tabla (según tu captura):
   [0] Código Interno
   [1] CUIT
   [2] Provincia de Domicilio
   [3] Domicilio Completo
   [4] Teléfono
   [5] Correo Electrónico
   [6] Sitio Web
   [7] Nro. Registro
   [8] Expediente
`);

  console.log('\n⏸️  El navegador permanecerá abierto...');
  console.log('   Presiona Ctrl+C cuando termines.\n');

  // Mantener abierto
  await new Promise(resolve => {
    process.on('SIGINT', async () => {
      console.log('\n🔒 Cerrando navegador...');
      await browser.close();
      console.log('✅ Debug completado');
      process.exit(0);
    });
  });
}

// Ejecutar
debugSISA().catch(console.error);

