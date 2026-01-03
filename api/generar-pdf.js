// Endpoint para generar PDF con Puppeteer en Vercel
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const datos = req.body;

        if (!datos) {
            return res.status(400).json({ error: 'No data provided' });
        }

        // Generar PDF
        const pdfBuffer = await generarPDF(datos);

        // Enviar PDF como binario
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        res.setHeader('Content-Disposition', `attachment; filename="presupuesto_${datos.presupuesto?.numero || '00'}.pdf"`);
        return res.end(pdfBuffer);

    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: error.message });
    }
}

async function generarPDF(datos) {
    let browser;

    // Detectar si estamos en Vercel o en local
    const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isVercel) {
        // Vercel: usar @sparticuz/chromium
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
    } else {
        // Local: usar puppeteer con path específico para WSL
        const puppeteerFull = await import('puppeteer');
        browser = await puppeteerFull.default.launch({
            headless: 'new',
            executablePath: '/home/braianaxeltroncosodeveloper/.cache/puppeteer/chrome/linux-143.0.7499.146/chrome-linux64/chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    const page = await browser.newPage();

    // Generar HTML
    const html = generarHTML(datos);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    return pdfBuffer;
}

function generarHTML(datos) {
    // Cargar imágenes como Base64 desde assets
    const assetsPath = path.join(__dirname, '..', 'assets');

    const toBase64 = (filename) => {
        try {
            const filePath = path.join(assetsPath, filename);
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath);
                return `data:image/png;base64,${data.toString('base64')}`;
            }
        } catch (e) {
            console.error(`Error loading ${filename}:`, e);
        }
        return '';
    };

    const logoPath = toBase64('logo-azul.png');
    const usuarioPath = toBase64('Usuario.png');
    const cotizacionPath = toBase64('Cotizacion.png');
    const plazoPath = toBase64('Plazo.png');

    // Formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const d = new Date(fecha + 'T00:00:00');
        return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Formatear número
    const formatearNumero = (valor) => {
        if (!valor) return '0';
        return new Intl.NumberFormat('es-AR').format(parseFloat(valor));
    };

    // Capitalizar
    const capitalizar = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // Formatear tipo de tarifa (solo descripción del equipaje)
    const formatearTarifa = (tarifa, idioma = 'es') => {
        if (!tarifa) return null;
        const mapeo = {
            es: {
                'basic': 'Solo mochila',
                'light': 'Mochila + Carry on',
                'full': 'Mochila + Carry on + Valija 23kg'
            },
            pt: {
                'basic': 'Só mochila',
                'light': 'Mochila + Carry on',
                'full': 'Mochila + Carry on + Mala 23kg'
            }
        };
        return mapeo[idioma]?.[tarifa] || mapeo['es'][tarifa] || null;
    };

    // Traducciones
    const TRADUCCIONES_PDF = {
        es: {
            datosCliente: 'Datos del cliente',
            nombre: 'Nombre',
            ciudad: 'Ciudad',
            fecha: 'Fecha',
            telefono: 'Teléfono',
            trechosAereos: 'Trechos aéreos',
            hospedaje: 'Hospedaje',
            hotel: 'Hotel',
            cuarto: 'Cuarto',
            entrada: 'Entrada',
            salida: 'Salida',
            regimen: 'Regimen',
            masInfo: 'Más información',
            cotizacion: 'Cotización',
            cotizacionTexto: 'Precio referido a dólar billete, caso el pago sea realizado en pesos argentinos, deberá ser considerado el valor referente al tipo de cambio del día.',
            plazo: 'Plazo de la propuesta',
            plazoTexto: 'Las tarifas seleccionadas están sujetas a disponibilidad y pueden cambiar sin previo aviso. Solo la emisión del voucher garantiza la tarifa.',
            valorPorPersona: 'VALOR POR PERSONA',
            valorTotal: 'VALOR TOTAL',
            adulto: 'adulto',
            adultos: 'adultos',
            transfer: 'Transfer',
            seguroViaje: 'Seguro de Viaje',
            alquilerVehiculo: 'Alquiler de Vehículo',
            directo: 'Directo',
            agente: 'Agente',
            email: 'Email',
            al: 'al',
            mediaPension: 'Media Pensión',
            pensionCompleta: 'Pensión Completa',
            todoIncluido: 'Todo Incluido',
            soloAlojamiento: 'Solo Alojamiento',
            desayuno: 'Desayuno'
        },
        pt: {
            datosCliente: 'Dados do cliente',
            nombre: 'Nome',
            ciudad: 'Cidade',
            fecha: 'Data',
            telefono: 'Telefone',
            trechosAereos: 'Trechos aéreos',
            hospedaje: 'Hospedagem',
            hotel: 'Hotel',
            cuarto: 'Quarto',
            entrada: 'Entrada',
            salida: 'Saída',
            regimen: 'Regime',
            masInfo: 'Mais informações',
            cotizacion: 'Cotação',
            cotizacionTexto: 'Preço referido ao dólar, caso o pagamento seja realizado em reais, deverá ser considerado o valor referente à taxa de câmbio do dia.',
            plazo: 'Prazo da proposta',
            plazoTexto: 'As tarifas selecionadas estão sujeitas à disponibilidade e podem mudar sem aviso prévio. Somente a emissão do voucher garante a tarifa.',
            valorPorPersona: 'VALOR POR PESSOA',
            valorTotal: 'VALOR TOTAL',
            adulto: 'adulto',
            adultos: 'adultos',
            transfer: 'Transfer',
            seguroViaje: 'Seguro Viagem',
            alquilerVehiculo: 'Aluguel de Veículo',
            directo: 'Direto',
            agente: 'Agente',
            email: 'E-mail',
            al: 'a',
            mediaPension: 'Meia Pensão',
            pensionCompleta: 'Pensão Completa',
            todoIncluido: 'Tudo Incluído',
            soloAlojamiento: 'Só Hospedagem',
            desayuno: 'Café da Manhã'
        }
    };

    const idioma = datos.idioma || 'es';
    const t = TRADUCCIONES_PDF[idioma] || TRADUCCIONES_PDF['es'];

    const formatearRegimenTraducido = (regimen) => {
        if (!regimen) return '';
        const mapeo = {
            'mediaPension': t.mediaPension,
            'pensionCompleta': t.pensionCompleta,
            'todoIncluido': t.todoIncluido,
            'soloAlojamiento': t.soloAlojamiento,
            'desayuno': t.desayuno
        };
        return mapeo[regimen] || capitalizar(regimen);
    };

    // Datos
    const agente = datos.agente || {};
    const cliente = datos.cliente || {};
    const presupuesto = datos.presupuesto || {};
    const vuelos = datos.vuelos || [];
    const hoteles = datos.hoteles || [];
    const valores = datos.valores || {};
    const moneda = datos.moneda || 'USD';
    const monedaSym = moneda === 'BRL' ? 'R$' : 'USD';

    // Servicios
    const servicios = [];
    if (datos.incluyeTransfer) servicios.push(t.transfer);
    if (datos.incluyeSeguro) servicios.push(t.seguroViaje);
    if (datos.incluyeVehiculo) servicios.push(t.alquilerVehiculo);
    const serviciosTexto = servicios.length > 0 ? ': ' + servicios.join(' + ') : '';

    // Ruta
    const primerVuelo = vuelos[0] || {};
    const ciudadOrigen = primerVuelo.origen || 'Origen';
    const ciudadDestino = cliente.destinoFinal || primerVuelo.destino || 'Destino';

    // Fechas vuelos
    const fechasVuelo = vuelos.filter(v => v.fecha).map(v => v.fecha).sort();
    const fechaIniVuelo = fechasVuelo[0] ? formatearFecha(fechasVuelo[0]) : '';
    const fechaFinVuelo = fechasVuelo[fechasVuelo.length - 1] ? formatearFecha(fechasVuelo[fechasVuelo.length - 1]) : fechaIniVuelo;
    const fechasVueloTexto = fechaIniVuelo === fechaFinVuelo ? fechaIniVuelo : `${fechaIniVuelo} ${t.al} ${fechaFinVuelo}`;

    // HTML Vuelos - Separados por Ida y Vuelta
    const renderizarVuelo = (vuelo, esIda) => {
        const izqCodigo = esIda ? vuelo.origen : vuelo.destino;
        const izqHora = esIda ? vuelo.horaSalida : vuelo.horaLlegada;
        const derCodigo = esIda ? vuelo.destino : vuelo.origen;
        const derHora = esIda ? vuelo.horaLlegada : vuelo.horaSalida;
        const llegaSiguienteDia = vuelo.horaLlegada && vuelo.horaSalida && vuelo.horaLlegada < vuelo.horaSalida;
        const izqMas1 = !esIda && llegaSiguienteDia ? '<sup>+1</sup>' : '';
        const derMas1 = esIda && llegaSiguienteDia ? '<sup>+1</sup>' : '';

        return `
        <div class="vuelo">
            <div><span class="vuelo-badge">${vuelo.aerolinea || 'AIRLINE'}</span></div>
            <div class="vuelo-tiempo">
                <div class="hora">${izqHora || '--:--'}${izqMas1}</div>
                <div class="codigo">${izqCodigo || '---'}</div>
            </div>
            <div class="vuelo-flecha">
                <div class="duracion">${vuelo.duracion || ''}</div>
                <div class="linea-container">
                    <div class="linea"></div>
                    <span class="avion ${esIda ? 'ida' : 'vuelta'}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></span>
                </div>
                <div class="escalas">${(!vuelo.escalas || vuelo.escalas.toLowerCase() === 'directo') ? t.directo : ''}</div>
            </div>
            <div class="vuelo-tiempo">
                <div class="hora">${derHora || '--:--'}${derMas1}</div>
                <div class="codigo">${derCodigo || '---'}</div>
            </div>
        </div>`;
    };

    // Separar vuelos por tipo
    const vuelosIda = vuelos.filter(v => (v.numero || v.origen) && (v.tipo === 'ida' || !v.tipo));
    const vuelosVuelta = vuelos.filter(v => (v.numero || v.origen) && v.tipo === 'vuelta');

    let vuelosHTML = '';

    // Sección IDA
    if (vuelosIda.length > 0) {
        vuelosHTML += `<div class="vuelos-seccion-titulo">${idioma === 'pt' ? 'IDA' : 'IDA'}</div>`;
        vuelosIda.forEach(vuelo => {
            vuelosHTML += renderizarVuelo(vuelo, true);
        });
    }

    // Sección VUELTA
    if (vuelosVuelta.length > 0) {
        vuelosHTML += `<div class="vuelos-seccion-titulo">${idioma === 'pt' ? 'VOLTA' : 'VUELTA'}</div>`;
        vuelosVuelta.forEach(vuelo => {
            vuelosHTML += renderizarVuelo(vuelo, false);
        });
    }

    // HTML Hoteles
    let hotelesHTML = '';
    hoteles.forEach(hotel => {
        if (hotel.nombre) {
            const imagenHTML = hotel.imagen
                ? `<img src="${hotel.imagen}" alt="${hotel.nombre}">`
                : `<span>Imagen del hotel</span>`;

            hotelesHTML += `
            <div class="hotel">
                <div class="hotel-imagen">${imagenHTML}</div>
                <div class="hotel-datos">
                    <p><strong>${t.hotel}:</strong> ${hotel.nombre}</p>
                    <p><strong>${t.cuarto}:</strong> ${capitalizar(hotel.tipoCuarto) || ''}</p>
                    <p><strong>${t.entrada}:</strong> ${formatearFecha(hotel.fechaEntrada)}</p>
                    <p><strong>${t.salida}:</strong> ${formatearFecha(hotel.fechaSalida)}</p>
                    <p><strong>${t.regimen}:</strong> ${formatearRegimenTraducido(hotel.regimen)}</p>
                </div>
            </div>`;
        }
    });

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Presupuesto - Freest Travel</title>
    <style>
        @page { size: A4; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', Arial, sans-serif; background: white; }
        .pdf-container { width: 210mm; height: 297mm; background: white; position: relative; overflow: hidden; }
        .barra-azul-top { background: #00366B; height: 4mm; width: 100%; }
        .barra-azul-bottom { background: #00366B; height: 5mm; width: 100%; position: absolute; bottom: -1px; left: 0; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 5mm 10mm; background: white; }
        .logo img { height: 11.5mm; }
        .datos-agente { text-align: right; font-size: 9px; color: #1e293b; }
        .datos-agente p { margin: 2px 0; }
        .datos-agente strong { font-weight: bold; }
        .barra-destino { display: flex; width: 100%; position: relative; }
        .destino-info { background: #ed6e1a; width: 60%; padding: 4mm 10mm; color: white; position: relative; z-index: 1; }
        .destino-info h2 { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
        .destino-info p { font-size: 14px; }
        .numero-presupuesto { background: #00366B; width: 40%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold; position: relative; z-index: 1; }
        .barra-destino::after { content: ''; position: absolute; left: 60%; top: -2px; height: calc(100% + 4px); width: 30px; background: white; transform: translateX(-50%) skewX(-15deg); z-index: 2; }
        .seccion { padding: 4mm 10mm; }
        .seccion-header { display: flex; align-items: center; gap: 0; margin-bottom: 3mm; }
        .seccion-header img { height: 70px; width: auto; margin-left: -10px; }
        .seccion-header h3 { color: #000000; font-size: 14px; font-weight: bold; }
        .datos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 0; font-size: 10px; color: #1e293b; }
        .datos-grid p { margin: 0; }
        .datos-grid p:nth-child(even) { text-align: right; padding-right: 10mm; }
        .datos-grid p strong { font-weight: bold; }
        .separador { border-bottom: 1px solid #e2e8f0; margin: 2mm 10mm; }
        .barra-titulo { background: #ed6e1a; color: white; padding: 3mm 10mm; font-size: 14px; font-weight: bold; }
        .vuelos-container { padding: 4mm 0; }
        .vuelo { padding: 2mm 10mm; display: flex; align-items: center; gap: 5mm; }
        .vuelo-badge { background: #00366B; color: white; padding: 1mm 3mm; border-radius: 3px; font-size: 7px; font-weight: bold; }
        .vuelo-tiempo { text-align: center; }
        .vuelo-tiempo .hora { font-size: 16px; font-weight: bold; color: #1e293b; }
        .vuelo-tiempo .hora sup { font-size: 9px; color: #ed6e1a; font-weight: bold; }
        .vuelo-tiempo .codigo { font-size: 9px; color: #64748b; }
        .vuelo-flecha { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
        .vuelo-flecha .duracion { font-size: 9px; color: #64748b; margin-bottom: 3px; }
        .vuelo-flecha .linea-container { width: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
        .vuelo-flecha .linea { width: 70%; height: 2px; background: linear-gradient(90deg, #00366B 0%, #ed6e1a 100%); border-radius: 1px; }
        .vuelo-flecha .avion { position: absolute; width: 16px; height: 16px; color: #00366B; }
        .vuelo-flecha .avion svg { width: 100%; height: 100%; }
        .vuelo-flecha .avion.ida { right: 10%; transform: rotate(90deg); }
        .vuelo-flecha .avion.vuelta { left: 10%; transform: rotate(-90deg); }
        .vuelo-flecha .escalas { font-size: 9px; color: #ed6e1a; margin-top: 3px; font-weight: 500; }
        .tarifa-info { display: flex; align-items: center; gap: 2mm; padding: 2mm 10mm; font-size: 9px; color: #64748b; }
        .tarifa-descripcion { color: #64748b; font-weight: 500; }
        .vuelos-seccion-titulo { font-size: 10px; font-weight: 600; color: #00366B; padding: 2mm 10mm 1mm 10mm; margin-top: 1mm; text-transform: uppercase; letter-spacing: 0.5px; }
        .hoteles-container { display: flex; flex-wrap: wrap; gap: 3mm; padding: 3mm 10mm; }
        .hotel { display: flex; gap: 3mm; flex: 1 1 calc(50% - 3mm); min-width: 85mm; max-width: 100%; }
        .hoteles-container .hotel:only-child { flex: 1 1 100%; max-width: 100%; }
        .hotel-imagen { width: 40mm; height: 28mm; background: #f4f4f4; border: 1px solid #e2e8f0; border-radius: 2mm; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 8px; overflow: hidden; flex-shrink: 0; }
        .hotel-imagen img { width: 100%; height: 100%; object-fit: cover; }
        .hotel-datos { font-size: 9px; color: #1e293b; flex: 1; }
        .hotel-datos p { margin: 1mm 0; }
        .hotel-datos strong { font-weight: bold; }
        .info-container { padding: 3mm 55mm 4mm 10mm; overflow: hidden; }
        .info-item { display: flex; align-items: center; gap: 0; padding: 1mm 0; font-size: 11px; color: #1e293b; }
        .info-icon { width: 40px; height: 40px; object-fit: contain; flex-shrink: 0; margin-right: 3mm; }
        .info-texto strong { font-weight: bold; }
        .valores-box { background: #ed6e1a; color: white; padding: 2mm 4mm; text-align: right; width: auto; position: absolute; bottom: 24mm; right: 0; }
        .valores-box p { margin: 0.5mm 0; white-space: nowrap; }
        .valores-box .por-persona { font-size: 9px; }
        .valores-box .total { font-size: 11px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="pdf-container">
        <div class="barra-azul-top"></div>
        <div class="header">
            <div class="logo"><img src="${logoPath}" alt="Freest Travel"></div>
            <div class="datos-agente">
                <p><strong>Cadastur:</strong> ${agente.cadastur || ''}</p>
                <p><strong>${t.agente}:</strong> ${agente.nombre || ''}</p>
                <p><strong>${t.telefono}:</strong> ${agente.telefono || ''}</p>
                <p><strong>${t.email}:</strong> ${agente.email || ''}</p>
            </div>
        </div>
        <div class="barra-destino">
            <div class="destino-info">
                <h2>${ciudadOrigen} - ${ciudadDestino}</h2>
                <p>${cliente.cantidadPasajeros || 1} ${(cliente.cantidadPasajeros || 1) > 1 ? t.adultos : t.adulto}${serviciosTexto}</p>
            </div>
            <div class="numero-presupuesto">N° ${(presupuesto.numero || '00').toString().padStart(4, '0')}</div>
        </div>
        <div class="seccion">
            <div class="seccion-header">
                <img src="${usuarioPath}" alt="Usuario">
                <h3>${t.datosCliente}</h3>
            </div>
            <div class="datos-grid">
                <p><strong>${t.nombre}:</strong> ${cliente.nombre || ''}</p>
                <p><strong>${t.ciudad}:</strong> ${cliente.ciudad || ''}</p>
                <p><strong>${t.fecha}:</strong> ${formatearFecha(presupuesto.fecha)}</p>
                <p><strong>${t.telefono}:</strong> ${cliente.telefono || ''}</p>
            </div>
        </div>
        <div class="separador"></div>
        ${vuelos.length > 0 && vuelos.some(v => v.numero || v.origen) ? `
        <div class="barra-titulo">${t.trechosAereos}${fechaIniVuelo ? ` - ${fechasVueloTexto}` : ''}</div>
        <div class="vuelos-container">
            ${presupuesto.tipoTarifa && formatearTarifa(presupuesto.tipoTarifa, idioma) ? `
            <div class="tarifa-info">
                <span class="tarifa-descripcion">${formatearTarifa(presupuesto.tipoTarifa, idioma)}</span>
            </div>` : ''}
            ${vuelosHTML}
        </div>` : ''}
        ${hoteles.length > 0 && hoteles.some(h => h.nombre) ? `
        <div class="barra-titulo">${t.hospedaje}</div>
        <div class="hoteles-container">${hotelesHTML}</div>` : ''}
        <div class="barra-titulo">${t.masInfo}</div>
        <div class="info-container">
            ${idioma !== 'pt' ? `
            <div class="info-item">
                <img class="info-icon" src="${cotizacionPath}" alt="Cotización">
                <div class="info-texto"><strong>${t.cotizacion}:</strong> ${t.cotizacionTexto}</div>
            </div>` : ''}
            <div class="info-item">
                <img class="info-icon" src="${plazoPath}" alt="Plazo">
                <div class="info-texto"><strong>${t.plazo}:</strong> ${t.plazoTexto}</div>
            </div>
        </div>
        <div class="valores-box">
            <p class="por-persona">${t.valorPorPersona}: ${monedaSym} ${formatearNumero(valores.porPersona)}</p>
            <p class="total">${t.valorTotal}: ${monedaSym} ${formatearNumero(valores.total)}</p>
        </div>
        <div class="barra-azul-bottom"></div>
    </div>
</body>
</html>`;
}
