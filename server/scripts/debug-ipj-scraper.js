/**
 * Script de Debug para el Scraper de IPJ
 * 
 * Este script te ayuda a ver qué encuentra Puppeteer en el sitio de IPJ
 * y ajustar los selectores según sea necesario.
 * 
 * Uso:
 * node scripts/debug-ipj-scraper.js
 */

import puppeteer from 'puppeteer';

const IPJ_URL = 'https://ipj.cba.gov.ar/';

async function debugIPJ() {
  console.log('🔍 Iniciando debug del scraper IPJ...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // IMPORTANTE: Ver el navegador
    slowMo: 100, // Ralentizar para poder ver
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('🌐 Navegando a:', IPJ_URL);
  await page.goto(IPJ_URL, { waitUntil: 'networkidle2' });
  
  console.log('✅ Página cargada\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ========================================
  // ANÁLISIS 1: Encontrar enlaces principales
  // ========================================
  console.log('📋 ANÁLISIS 1: Enlaces principales en la página');
  console.log('='.repeat(60));
  
  const enlaces = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button, div[onclick]'));
    return links
      .filter(el => el.textContent.trim().length > 0)
      .map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim().substring(0, 80),
        href: el.href || '',
        onclick: el.onclick ? 'true' : 'false'
      }))
      .slice(0, 30); // Primeros 30
  });

  enlaces.forEach((link, i) => {
    console.log(`\n${i + 1}. [${link.tag.toUpperCase()}]`);
    console.log(`   Texto: "${link.text}"`);
    if (link.href) console.log(`   Href: ${link.href}`);
    if (link.onclick === 'true') console.log(`   ⚠️  Tiene onclick`);
  });

  console.log('\n' + '='.repeat(60));

  // ========================================
  // ANÁLISIS 2: Buscar términos específicos
  // ========================================
  console.log('\n📋 ANÁLISIS 2: Búsqueda de términos específicos');
  console.log('='.repeat(60));

  const terminos = [
    'Fundaciones',
    'Fundación',
    'Asociaciones Civiles',
    'Asociación Civil',
    'Consulta',
    'Estado',
    'Situación',
    'Iniciar',
    'Buscar'
  ];

  for (const termino of terminos) {
    const encontrado = await page.evaluate((term) => {
      const elements = Array.from(document.querySelectorAll('*'));
      const matches = elements.filter(el => 
        el.textContent.includes(term) && 
        el.children.length === 0 && // Solo elementos sin hijos (texto puro)
        el.textContent.trim().length < 200
      );
      return matches.map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim(),
        clickable: el.tagName === 'A' || el.tagName === 'BUTTON' || el.onclick !== null
      }));
    }, termino);

    if (encontrado.length > 0) {
      console.log(`\n✅ "${termino}" encontrado (${encontrado.length} veces):`);
      encontrado.slice(0, 3).forEach(match => {
        console.log(`   - [${match.tag}] ${match.clickable ? '🖱️ ' : ''}"${match.text}"`);
      });
    } else {
      console.log(`\n❌ "${termino}" NO encontrado`);
    }
  }

  console.log('\n' + '='.repeat(60));

  // ========================================
  // ANÁLISIS 3: Campos de formulario
  // ========================================
  console.log('\n📋 ANÁLISIS 3: Campos de formulario en la página');
  console.log('='.repeat(60));

  const inputs = await page.evaluate(() => {
    const fields = Array.from(document.querySelectorAll('input, select, textarea'));
    return fields.map(field => ({
      tag: field.tagName.toLowerCase(),
      type: field.type || 'N/A',
      name: field.name || 'N/A',
      id: field.id || 'N/A',
      placeholder: field.placeholder || 'N/A',
      visible: field.offsetParent !== null
    }));
  });

  if (inputs.length > 0) {
    inputs.forEach((input, i) => {
      console.log(`\n${i + 1}. [${input.tag.toUpperCase()}] Type: ${input.type}`);
      console.log(`   ID: ${input.id}`);
      console.log(`   Name: ${input.name}`);
      if (input.placeholder !== 'N/A') console.log(`   Placeholder: ${input.placeholder}`);
      console.log(`   Visible: ${input.visible ? '✅' : '❌'}`);
    });
  } else {
    console.log('❌ No se encontraron campos de formulario en esta página');
  }

  console.log('\n' + '='.repeat(60));

  // ========================================
  // ANÁLISIS 4: Botones
  // ========================================
  console.log('\n📋 ANÁLISIS 4: Botones en la página');
  console.log('='.repeat(60));

  const botones = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
    return buttons.map(btn => ({
      tag: btn.tagName.toLowerCase(),
      type: btn.type || 'N/A',
      text: btn.textContent?.trim() || btn.value || 'Sin texto',
      id: btn.id || 'N/A',
      visible: btn.offsetParent !== null
    }));
  });

  if (botones.length > 0) {
    botones.forEach((btn, i) => {
      console.log(`\n${i + 1}. [${btn.tag.toUpperCase()}] "${btn.text}"`);
      console.log(`   ID: ${btn.id}`);
      console.log(`   Type: ${btn.type}`);
      console.log(`   Visible: ${btn.visible ? '✅' : '❌'}`);
    });
  } else {
    console.log('❌ No se encontraron botones en esta página');
  }

  console.log('\n' + '='.repeat(60));

  // ========================================
  // ANÁLISIS 5: Estructura de la página
  // ========================================
  console.log('\n📋 ANÁLISIS 5: Estructura HTML resumida');
  console.log('='.repeat(60));

  const estructura = await page.evaluate(() => {
    const body = document.body;
    const sections = Array.from(body.children);
    return sections.map(section => ({
      tag: section.tagName.toLowerCase(),
      id: section.id || 'N/A',
      class: section.className || 'N/A',
      children: section.children.length
    })).slice(0, 10);
  });

  estructura.forEach((section, i) => {
    console.log(`${i + 1}. <${section.tag}> - ${section.children} hijos`);
    if (section.id !== 'N/A') console.log(`   ID: ${section.id}`);
    if (section.class !== 'N/A') console.log(`   Class: ${section.class.substring(0, 50)}`);
  });

  console.log('\n' + '='.repeat(60));

  // ========================================
  // RECOMENDACIONES
  // ========================================
  console.log('\n💡 RECOMENDACIONES PARA AJUSTAR EL SCRAPER');
  console.log('='.repeat(60));
  console.log(`
1. Revisa los enlaces del ANÁLISIS 1
   - Busca el que contiene "Fundaciones" o "Asociaciones Civiles"
   - Anota su estructura (tag, href, onclick)

2. Si hay campos de formulario (ANÁLISIS 3)
   - Busca campos visibles
   - Anota sus IDs o names para usarlos en el selector

3. Si hay botones (ANÁLISIS 4)
   - Busca el botón de "Buscar", "Consultar" o "Enviar"
   - Anota su selector

4. Si el sitio usa JavaScript para cargar contenido
   - Puede necesitar más tiempo de espera
   - O detectar la navegación mediante eventos

5. Toma screenshots con:
   await page.screenshot({ path: 'ipj-debug.png', fullPage: true });
`);

  console.log('\n⏸️  El navegador permanecerá abierto para que puedas inspeccionar...');
  console.log('   Presiona Ctrl+C cuando termines de revisar.\n');

  // Mantener el navegador abierto
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
debugIPJ().catch(console.error);

