// Generador de PDF usando Puppeteer - Renderiza HTML con CSS exacto
// Este archivo se ejecuta desde Node.js, NO desde el navegador

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generarPDF(datos, outputPath) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--allow-file-access-from-files',
            '--disable-web-security'
        ]
    });

    const page = await browser.newPage();

    // Generar HTML con los datos
    const html = generarHTML(datos);

    // Cargar el HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generar PDF
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    console.log(`PDF generado: ${outputPath}`);
    return outputPath;
}

function generarHTML(datos) {
    // Cargar imágenes como Base64
    const assetsPath = path.join(__dirname, '..', 'assets');

    const toBase64 = (filename) => {
        const filePath = path.join(assetsPath, filename);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath);
            return `data:image/png;base64,${data.toString('base64')}`;
        }
        return '';
    };

    const logoPath = toBase64('Logo.png');
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

    // Formatear régimen (separar palabras camelCase)
    const formatearRegimen = (regimen) => {
        if (!regimen) return '';
        const mapeo = {
            'mediaPension': 'Media Pensión',
            'pensionCompleta': 'Pensión Completa',
            'todoIncluido': 'Todo Incluido',
            'soloAlojamiento': 'Solo Alojamiento',
            'desayuno': 'Desayuno'
        };
        return mapeo[regimen] || capitalizar(regimen);
    };

    // Formatear tipo de tarifa (con traducciones)
    const formatearTarifa = (tarifa, idioma = 'es') => {
        if (!tarifa) return null;
        const mapeo = {
            es: {
                'basic': { nombre: 'BASIC', descripcion: 'Solo mochila' },
                'light': { nombre: 'LIGHT', descripcion: 'Mochila + Carry on' },
                'full': { nombre: 'FULL', descripcion: 'Mochila + Carry on + Valija 23kg' }
            },
            pt: {
                'basic': { nombre: 'BASIC', descripcion: 'Só mochila' },
                'light': { nombre: 'LIGHT', descripcion: 'Mochila + Bagagem de mão' },
                'full': { nombre: 'FULL', descripcion: 'Mochila + Bagagem de mão + Mala 23kg' }
            }
        };
        return mapeo[idioma]?.[tarifa] || mapeo['es'][tarifa] || null;
    };

    // Traducciones del PDF
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
            // Header agente
            agente: 'Agente',
            email: 'Email',
            al: 'al',
            // Regimen
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
            // Header agente
            agente: 'Agente',
            email: 'E-mail',
            al: 'a',
            // Regimen
            mediaPension: 'Meia Pensão',
            pensionCompleta: 'Pensão Completa',
            todoIncluido: 'Tudo Incluído',
            soloAlojamiento: 'Só Hospedagem',
            desayuno: 'Café da Manhã'
        }
    };

    // Obtener idioma y traducciones
    const idioma = datos.idioma || 'es';
    const t = TRADUCCIONES_PDF[idioma] || TRADUCCIONES_PDF['es'];

    // Formatear régimen con traducciones
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

    // Servicios incluidos
    const servicios = [];
    if (datos.incluyeTransfer) servicios.push(t.transfer);
    if (datos.incluyeSeguro) servicios.push(t.seguroViaje);
    if (datos.incluyeVehiculo) servicios.push(t.alquilerVehiculo);
    const serviciosTexto = servicios.length > 0 ? ': ' + servicios.join(' + ') : '';

    // Ruta del viaje
    const primerVuelo = vuelos[0] || {};
    const ultimoVuelo = vuelos[vuelos.length - 1] || primerVuelo;
    const ciudadOrigen = primerVuelo.origen || 'Origen';
    const ciudadDestino = cliente.destinoFinal || ultimoVuelo.destino || 'Destino';

    // Fechas vuelos
    const fechasVuelo = vuelos.filter(v => v.fecha).map(v => v.fecha).sort();
    const fechaIniVuelo = fechasVuelo[0] ? formatearFecha(fechasVuelo[0]) : '';
    const fechaFinVuelo = fechasVuelo[fechasVuelo.length - 1] ? formatearFecha(fechasVuelo[fechasVuelo.length - 1]) : fechaIniVuelo;
    // Si es solo ida (misma fecha), mostrar solo una
    const fechasVueloTexto = fechaIniVuelo === fechaFinVuelo ? fechaIniVuelo : `${fechaIniVuelo} ${t.al} ${fechaFinVuelo}`;

    // Generar HTML de vuelos
    let vuelosHTML = '';
    vuelos.forEach((vuelo, idx) => {
        if (vuelo.numero || vuelo.origen) {
            const esIda = vuelo.tipo === 'ida' || !vuelo.tipo;

            // Para vuelta, invertir códigos Y horas

            const izqCodigo = esIda ? vuelo.origen : vuelo.destino;
            const izqHora = esIda ? vuelo.horaSalida : vuelo.horaLlegada;
            const derCodigo = esIda ? vuelo.destino : vuelo.origen;
            const derHora = esIda ? vuelo.horaLlegada : vuelo.horaSalida;

            // Detectar si llega al día siguiente (hora llegada < hora salida)
            const llegaSiguienteDia = vuelo.horaLlegada && vuelo.horaSalida && vuelo.horaLlegada < vuelo.horaSalida;
            // El +1 va en la hora de llegada: derHora para IDA, izqHora para VUELTA
            const izqMas1 = !esIda && llegaSiguienteDia ? '<sup>+1</sup>' : '';
            const derMas1 = esIda && llegaSiguienteDia ? '<sup>+1</sup>' : '';


            vuelosHTML += `
            <div class="vuelo">
                <div>
                    <span class="vuelo-badge">${vuelo.aerolinea || 'AIRLINE'}</span>
                </div>
                <div class="vuelo-tiempo">
                    <div class="hora">${izqHora || '--:--'}${izqMas1}</div>
                    <div class="codigo">${izqCodigo || '---'}</div>
                </div>
                <div class="vuelo-flecha">
                    <div class="duracion">${vuelo.duracion || ''}</div>
                    <div class="linea-container">
                        <div class="linea"></div>
                        <span class="avion ${esIda ? 'ida' : 'vuelta'}">✈</span>
                    </div>
                    <div class="escalas">${(!vuelo.escalas || vuelo.escalas.toLowerCase() === 'directo') ? t.directo : ''}</div>
                </div>
                <div class="vuelo-tiempo">
                    <div class="hora">${derHora || '--:--'}${derMas1}</div>
                    <div class="codigo">${derCodigo || '---'}</div>
                </div>
            </div>`;
        }
    });

    // Generar HTML de hoteles
    let hotelesHTML = '';
    hoteles.forEach(hotel => {
        if (hotel.nombre) {
            const imagenHTML = hotel.imagen
                ? `<img src="${hotel.imagen}" alt="${hotel.nombre}">`
                : `<span>Imagen del hotel</span>`;

            const hotelNombreHTML = hotel.url
                ? `<a href="${hotel.url}" target="_blank" style="color: #435c91; text-decoration: underline;">${hotel.nombre}</a>`
                : hotel.nombre;

            hotelesHTML += `
            <div class="hotel">
                <div class="hotel-imagen">${imagenHTML}</div>
                <div class="hotel-datos">
                    <p><strong>${t.hotel}:</strong> ${hotelNombreHTML}</p>
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto - Freest Travel</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica', Arial, sans-serif;
            background: white;
        }

        .pdf-container {
            width: 210mm;
            height: 297mm;
            background: white;
            position: relative;
            overflow: hidden;
        }

        /* BARRA AZUL TOP */
        .barra-azul-top {
            background: #435c91;
            height: 4mm;
            width: 100%;
        }

        /* BARRA AZUL BOTTOM */
        .barra-azul-bottom {
            background: #435c91;
            height: 5mm;
            width: 100%;
            position: absolute;
            bottom: -1px;
            left: 0;
        }

        /* HEADER */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5mm 10mm;
            background: white;
        }

        .logo img {
            height: 18mm;
        }

        .datos-agente {
            text-align: right;
            font-size: 9px;
            color: #1e293b;
        }

        .datos-agente p {
            margin: 2px 0;
        }

        .datos-agente strong {
            font-weight: bold;
        }

        /* BARRA DESTINO */
        .barra-destino {
            display: flex;
            width: 100%;
            position: relative;
        }

        .destino-info {
            background: #ed6e1a;
            width: 60%;
            padding: 4mm 10mm;
            color: white;
            position: relative;
            z-index: 1;
        }

        .destino-info h2 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 2px;
        }

        .destino-info p {
            font-size: 14px;
        }

        .numero-presupuesto {
            background: #435c91;
            width: 40%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            font-weight: bold;
            position: relative;
            z-index: 1;
        }

        /* Diagonal blanca en el centro */
        .barra-destino::after {
            content: '';
            position: absolute;
            left: 60%;
            top: -2px;
            height: calc(100% + 4px);
            width: 30px;
            background: white;
            transform: translateX(-50%) skewX(-15deg);
            z-index: 2;
        }

        /* DATOS CLIENTE */
        .seccion {
            padding: 4mm 10mm;
        }

        .seccion-header {
            display: flex;
            align-items: center;
            gap: 0;
            margin-bottom: 3mm;
        }

        .seccion-header img {
            height: 70px;
            width: auto;
            margin-left: -10px;
        }

        .seccion-header h3 {
            color: #000000;
            font-size: 14px;
            font-weight: bold;
            text-align: left;
        }

        .datos-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2mm 0;
            font-size: 10px;
            color: #1e293b;
        }

        .datos-grid p {
            margin: 0;
        }

        .datos-grid p:nth-child(even) {
            text-align: right;
            padding-right: 10mm;
        }

        .datos-grid p strong {
            font-weight: bold;
        }

        .separador {
            border-bottom: 1px solid #e2e8f0;
            margin: 2mm 10mm;
        }

        /* BARRA TITULO SECCION */
        .barra-titulo {
            background: #ed6e1a;
            color: white;
            padding: 3mm 10mm;
            font-size: 14px;
            font-weight: bold;
        }

        /* VUELOS */
        .vuelos-container {
            padding: 4mm 0;
        }

        .vuelo {
            padding: 2mm 10mm;
            display: flex;
            align-items: center;
            gap: 5mm;
        }

        .vuelo-badge {
            background: #435c91;
            color: white;
            padding: 1mm 3mm;
            border-radius: 3px;
            font-size: 7px;
            font-weight: bold;
        }

        .vuelo-tiempo {
            text-align: center;
        }

        .vuelo-tiempo .hora {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
        }

        .vuelo-tiempo .hora sup {
            font-size: 9px;
            color: #ed6e1a;
            font-weight: bold;
        }

        .vuelo-tiempo .codigo {
            font-size: 9px;
            color: #64748b;
        }

        .vuelo-flecha {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }

        .vuelo-flecha .duracion {
            font-size: 9px;
            color: #64748b;
            margin-bottom: 3px;
        }

        .vuelo-flecha .linea-container {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .vuelo-flecha .linea {
            width: 70%;
            height: 2px;
            background: linear-gradient(90deg, #435c91 0%, #ed6e1a 100%);
            position: relative;
            border-radius: 1px;
        }

        .vuelo-flecha .avion {
            position: absolute;
            font-size: 16px;
            color: #435c91;
        }

        .vuelo-flecha .avion.ida {
            right: 10%;
            transform: rotate(0deg);
        }

        .vuelo-flecha .avion.vuelta {
            left: 10%;
            transform: rotate(180deg);
        }

        .vuelo-flecha .escalas {
            font-size: 9px;
            color: #ed6e1a;
            margin-top: 3px;
            font-weight: 500;
        }

        /* TARIFA */
        .tarifa-info {
            display: flex;
            align-items: center;
            gap: 2mm;
            padding: 2mm 10mm;
            font-size: 9px;
            color: #64748b;
        }

        .tarifa-badge {
            color: #435c91;
            font-weight: 600;
        }

        .tarifa-descripcion {
            color: #94a3b8;
        }

        .tarifa-iconos {
            font-size: 10px;
        }

        /* HOTELES CONTAINER */
        .hoteles-container {
            display: flex;
            flex-wrap: wrap;
            gap: 3mm;
            padding: 3mm 10mm;
        }

        /* HOTEL */
        .hotel {
            display: flex;
            gap: 3mm;
            flex: 1 1 calc(50% - 3mm);
            min-width: 85mm;
            max-width: 100%;
        }

        .hoteles-container .hotel:only-child {
            flex: 1 1 100%;
            max-width: 100%;
        }

        .hotel-imagen {
            width: 40mm;
            height: 28mm;
            background: #f4f4f4;
            border: 1px solid #e2e8f0;
            border-radius: 2mm;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-size: 8px;
            overflow: hidden;
            flex-shrink: 0;
        }

        .hotel-imagen img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .hotel-datos {
            font-size: 9px;
            color: #1e293b;
            flex: 1;
        }

        .hotel-datos p {
            margin: 1mm 0;
        }

        .hotel-datos strong {
            font-weight: bold;
        }

        /* MAS INFO */
        .info-container {
            padding: 3mm 10mm 4mm 10mm;
            overflow: hidden;
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 0;
            padding: 1mm 0;
            font-size: 11px;
            color: #1e293b;
        }

        .info-icon {
            width: 40px;
            height: 40px;
            object-fit: contain;
            object-position: center;
            flex-shrink: 0;
            margin-left: 0;
            margin-right: 3mm;
        }

        .info-texto strong {
            font-weight: bold;
        }

        /* VALORES */
        .valores-box {
            background: #ed6e1a;
            color: white;
            padding: 2mm 4mm;
            text-align: right;
            width: auto;
            position: absolute;
            bottom: 24mm;
            right: 0;
        }

        .valores-box p {
            margin: 0.5mm 0;
            white-space: nowrap;
        }

        .valores-box .por-persona {
            font-size: 9px;
        }

        .valores-box .total {
            font-size: 11px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <!-- BARRA AZUL TOP -->
        <div class="barra-azul-top"></div>

        <!-- HEADER -->
        <div class="header">
            <div class="logo">
                <img src="${logoPath}" alt="Freest Travel">
            </div>
            <div class="datos-agente">
                <p><strong>Cadastur:</strong> ${agente.cadastur || ''}</p>
                <p><strong>${t.agente}:</strong> ${agente.nombre || ''}</p>
                <p><strong>${t.telefono}:</strong> ${agente.telefono || ''}</p>
                <p><strong>${t.email}:</strong> ${agente.email || ''}</p>
            </div>
        </div>

        <!-- BARRA DESTINO -->
        <div class="barra-destino">
            <div class="destino-info">
                <h2>${ciudadOrigen} - ${ciudadDestino}</h2>
                <p>${cliente.cantidadPasajeros || 1} ${(cliente.cantidadPasajeros || 1) > 1 ? t.adultos : t.adulto}${serviciosTexto}</p>
            </div>
            <div class="numero-presupuesto">
                N° ${(presupuesto.numero || '00').toString().padStart(4, '0')}
            </div>
        </div>

        <!-- DATOS CLIENTE -->
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

        <!-- VUELOS -->
        ${vuelos.length > 0 && vuelos.some(v => v.numero || v.origen) ? `
        <div class="barra-titulo">${t.trechosAereos}${fechaIniVuelo ? ` - ${fechasVueloTexto}` : ''}</div>
        <div class="vuelos-container">
            ${presupuesto.tipoTarifa && formatearTarifa(presupuesto.tipoTarifa, idioma) ? `
            <div class="tarifa-info">
                <span class="tarifa-badge">${formatearTarifa(presupuesto.tipoTarifa, idioma).nombre}</span>
                <span class="tarifa-descripcion">- ${formatearTarifa(presupuesto.tipoTarifa, idioma).descripcion}</span>
            </div>
            ` : ''}
            ${vuelosHTML}
        </div>
        ` : ''}

        <!-- HOSPEDAJE -->
        ${hoteles.length > 0 && hoteles.some(h => h.nombre) ? `
        <div class="barra-titulo">${t.hospedaje}</div>
        <div class="hoteles-container">
            ${hotelesHTML}
        </div>
        ` : ''}

        <!-- MAS INFORMACION -->
        <div class="barra-titulo">${t.masInfo}</div>

        <div class="info-container">
            <div class="info-item">
                <img class="info-icon" src="${cotizacionPath}" alt="Cotización">
                <div class="info-texto">
                    <strong>${t.cotizacion}:</strong> ${t.cotizacionTexto}
                </div>
            </div>

            <div class="info-item">
                <img class="info-icon" src="${plazoPath}" alt="Plazo">
                <div class="info-texto">
                    <strong>${t.plazo}:</strong> ${t.plazoTexto}
                </div>
            </div>
        </div>

        <!-- VALORES -->
        <div class="valores-box">
            <p class="por-persona">${t.valorPorPersona}: ${monedaSym} ${formatearNumero(valores.porPersona)}</p>
            <p class="total">${t.valorTotal}: ${monedaSym} ${formatearNumero(valores.total)}</p>
        </div>

        <!-- BARRA AZUL BOTTOM -->
        <div class="barra-azul-bottom"></div>
    </div>
</body>
</html>`;
}

// Exportar para uso desde Node.js
module.exports = { generarPDF, generarHTML };

// Si se ejecuta directamente desde línea de comandos
if (require.main === module) {
    // Datos de prueba
    const datosPrueba = {
        agente: {
            cadastur: '37.206.629/0001-49',
            nombre: 'Alejandra Dagayo',
            telefono: '(351) 2537785',
            email: 'Alejandrafreest@gmail.com'
        },
        cliente: {
            nombre: 'Marcos Suegro',
            telefono: '3517063190',
            ciudad: 'Córdoba',
            cantidadPasajeros: 2
        },
        presupuesto: {
            numero: '0115',
            fecha: '2025-11-13'
        },
        vuelos: [
            {
                numero: 'LA8059',
                origen: 'COR',
                destino: 'GRU',
                fecha: '2026-02-25',
                horaSalida: '17:30',
                horaLlegada: '23:40',
                aerolinea: 'LATAM',
                duracion: '6h 10m',
                escalas: '1 escala GRU'
            },
            {
                numero: 'LA8060',
                origen: 'GIG',
                destino: 'COR',
                fecha: '2026-03-06',
                horaSalida: '23:55',
                horaLlegada: '10:00+1',
                aerolinea: 'LATAM',
                duracion: '6h 50m',
                escalas: '1 escala SDU'
            }
        ],
        hoteles: [
            {
                nombre: 'Hotel Brisa Tower',
                tipoCuarto: '2 Matrimoniales Premium (Vista al mar)',
                fechaEntrada: '2026-02-25',
                fechaSalida: '2026-03-06',
                regimen: 'Desayuno incluido'
            }
        ],
        valores: {
            porPersona: 1350,
            total: 5400
        },
        moneda: 'USD',
        incluyeTransfer: true,
        incluyeSeguro: true,
        incluyeVehiculo: false
    };

    const outputPath = path.join(__dirname, '..', 'presupuesto_test.pdf');
    generarPDF(datosPrueba, outputPath)
        .then(() => console.log('¡PDF generado exitosamente!'))
        .catch(err => console.error('Error:', err));
}
