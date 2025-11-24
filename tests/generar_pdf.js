#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PROJECT_DIR = path.join(__dirname, '..');
const HTML_FILE = `file://${path.join(PROJECT_DIR, 'index.html')}`;

const DATOS = {
    nombreAgente: "Alejandra Dagayo",
    telefonoAgente: "(351) 2537785",
    nombreCliente: "Marcos Suegro",
    telefonoCliente: "3517063190",
    ciudadCliente: "Córdoba",
    cantidadPasajeros: "2",
    fechaPresupuesto: "2025-11-13",
    tipoViaje: "idaVuelta",
    valorPorPersona: "1350",
    vuelos: [
        { numero: "LA8059", origen: "COR", destino: "GRU", fecha: "2026-02-25", horaSalida: "17:30", horaLlegada: "23:40", aerolinea: "LATAM", duracion: "6h 10m", escalas: "1 escala GRU" },
        { numero: "LA8060", origen: "GIG", destino: "COR", fecha: "2026-03-06", horaSalida: "23:55", horaLlegada: "10:00", aerolinea: "LATAM", duracion: "6h 50m", escalas: "1 escala SDU" }
    ],
    hotel: { nombre: "Hotel Brisa Tower", fechaEntrada: "2026-02-25", fechaSalida: "2026-03-06", regimen: "desayuno" }
};

(async () => {
    console.log('Generando PDF...');

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Configurar descarga a /tests
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: __dirname
    });

    page.on('console', msg => {
        if (msg.text().includes('Error')) console.log('BROWSER:', msg.text());
    });

    await page.goto(HTML_FILE, { waitUntil: 'networkidle0' });

    // Llenar formulario
    await page.type('#nombreAgente', DATOS.nombreAgente);
    await page.type('#telefonoAgente', DATOS.telefonoAgente);
    await page.type('#nombreCliente', DATOS.nombreCliente);
    await page.type('#telefonoCliente', DATOS.telefonoCliente);
    await page.type('#ciudadCliente', DATOS.ciudadCliente);
    await page.type('#cantidadPasajeros', DATOS.cantidadPasajeros);
    await page.$eval('#fechaPresupuesto', (el, val) => el.value = val, DATOS.fechaPresupuesto);

    await page.select('#tipoViaje', DATOS.tipoViaje);
    await new Promise(r => setTimeout(r, 500));

    // Vuelos
    const vueloItems = await page.$$('.vuelo-item');
    for (let i = 0; i < Math.min(vueloItems.length, DATOS.vuelos.length); i++) {
        const v = DATOS.vuelos[i];
        await vueloItems[i].$eval('.vuelo-numero', (el, val) => el.value = val, v.numero);
        await vueloItems[i].$eval('.vuelo-origen', (el, val) => el.value = val, v.origen);
        await vueloItems[i].$eval('.vuelo-destino', (el, val) => el.value = val, v.destino);
        await vueloItems[i].$eval('.vuelo-fecha', (el, val) => { el.disabled = false; el.value = val; }, v.fecha);
        await vueloItems[i].$eval('.vuelo-hora-salida', (el, val) => el.value = val, v.horaSalida);
        await vueloItems[i].$eval('.vuelo-hora-llegada', (el, val) => el.value = val, v.horaLlegada);
        await vueloItems[i].$eval('.vuelo-aerolinea', (el, val) => el.value = val, v.aerolinea);
        await vueloItems[i].$eval('.vuelo-duracion', (el, val) => el.value = val, v.duracion);
        await vueloItems[i].$eval('.vuelo-escalas', (el, val) => el.value = val, v.escalas);
    }

    // Hotel
    const hotelItems = await page.$$('.hotel-item');
    if (hotelItems.length > 0) {
        await hotelItems[0].$eval('.hotel-nombre', (el, v) => el.value = v, DATOS.hotel.nombre);
        await hotelItems[0].$eval('.hotel-fecha-entrada', (el, v) => el.value = v, DATOS.hotel.fechaEntrada);
        await hotelItems[0].$eval('.hotel-fecha-salida', (el, v) => el.value = v, DATOS.hotel.fechaSalida);
        await hotelItems[0].$eval('.hotel-regimen', (el, v) => el.value = v, DATOS.hotel.regimen);
    }

    // Transfer y Seguro = Sí
    await page.evaluate(() => {
        document.querySelectorAll('.toggle-buttons').forEach(group => {
            const siBtn = group.querySelector('button:last-child');
            if (siBtn) siBtn.click();
        });
    });

    await page.type('#valorPorPersona', DATOS.valorPorPersona);
    await new Promise(r => setTimeout(r, 300));

    // Exportar PDF
    await page.click('.btn-pdf');
    await new Promise(r => setTimeout(r, 3000));

    await browser.close();

    // Mover PDF de Downloads a /tests
    const homeDir = require('os').homedir();
    const downloadsDir = path.join(homeDir, 'Downloads');
    const downloadFiles = fs.readdirSync(downloadsDir)
        .filter(f => f.startsWith('presupuesto') && f.endsWith('.pdf'))
        .map(f => ({ name: f, time: fs.statSync(path.join(downloadsDir, f)).mtime }))
        .sort((a, b) => b.time - a.time);

    if (downloadFiles.length > 0) {
        const latest = downloadFiles[0].name;
        const src = path.join(downloadsDir, latest);
        const dest = path.join(__dirname, 'presupuesto_test.pdf');
        fs.copyFileSync(src, dest);
        console.log(`✓ PDF copiado a: ${dest}`);
    } else {
        console.log('✗ No se encontró el PDF en Downloads');
    }
})();
