// Módulo de exportación a PDF - Freest Travel
// Intenta usar Puppeteer (servidor), si no está disponible usa jsPDF

async function exportarPDF() {
    console.log('=== INICIANDO EXPORTAR PDF ===');

    try {
        // Validar formulario antes de exportar
        if (typeof validarFormulario === 'function') {
            const esValido = validarFormulario();
            if (!esValido) {
                console.log('Formulario inválido, cancelando exportación');
                return;
            }
        }

        const datos = recolectarDatos();
        console.log('Datos recolectados:', datos);

        // Intentar con el servidor Puppeteer primero
        try {
            const response = await fetch('http://localhost:3000/api/generar-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            // Manejar errores HTTP específicos
            if (!response.ok) {
                const errorMsg = `HTTP ${response.status}`;
                console.error('Error del servidor:', errorMsg);

                // Si es error 413 (payload muy grande), mostrar error amigable
                if (response.status === 413) {
                    if (typeof mostrarErrorAmigable === 'function') {
                        mostrarErrorAmigable('413 Payload Too Large');
                    } else {
                        showToast('La imagen es muy grande. Intentá con una más pequeña.', 'error');
                    }
                    return;
                }

                // Si es error 500, mostrar error amigable
                if (response.status === 500) {
                    if (typeof mostrarErrorAmigable === 'function') {
                        mostrarErrorAmigable('500 Internal Server Error');
                    } else {
                        showToast('Error del servidor. Revisá los datos e intentá de nuevo.', 'error');
                    }
                    return;
                }

                // Otros errores, intentar fallback
                throw new Error(errorMsg);
            }

            // Descargar el PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `presupuesto_${datos.presupuesto.numero || 'sin-numero'}_${datos.cliente.nombre || 'cliente'}.pdf`.replace(/\s+/g, '_');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            if (typeof showToast === 'function') {
                showToast('PDF exportado correctamente', 'success');
            }
            console.log('=== PDF EXPORTADO (PUPPETEER) ===');
            return;

        } catch (serverError) {
            console.log('Error con servidor Puppeteer:', serverError.message);

            // Si es un error de red (servidor no disponible), intentar fallback
            if (serverError.message === 'Failed to fetch' || serverError.name === 'TypeError') {
                console.log('Servidor no disponible, usando jsPDF fallback');
                await exportarPDFjsPDF(datos);
                return;
            }

            // Si es otro tipo de error, propagarlo
            throw serverError;
        }

    } catch (error) {
        console.error('ERROR EN EXPORTAR PDF:', error);

        // Usar el sistema de errores amigables
        if (typeof mostrarErrorAmigable === 'function') {
            mostrarErrorAmigable(error.message || error.toString());
        } else {
            // Fallback al toast si no está disponible mostrarErrorAmigable
            showToast('Error al generar el PDF. Revisá los datos e intentá de nuevo.', 'error');
        }
    }
}

// Exportación con jsPDF (fallback)
async function exportarPDFjsPDF(datos) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const PAGE_WIDTH = 210;
    const PAGE_HEIGHT = 297;
    const MARGIN = 10;

    const NARANJA = [237, 110, 26];
    const AZUL = [67, 92, 145];
    const TEXTO_PRIMARIO = [30, 41, 59];
    const TEXTO_SECUNDARIO = [100, 116, 139];
    const BORDE = [226, 232, 240];
    const BLANCO = [255, 255, 255];
    const FONDO_CLARO = [244, 244, 244];

    let y = 0;

    // 1. BARRA AZUL TOP
    doc.setFillColor(...AZUL);
    doc.rect(0, 0, PAGE_WIDTH, 4, 'F');
    y = 4;

    // 2. HEADER
    y += 5;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NARANJA);
    doc.text('FREEST', MARGIN, y + 8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...AZUL);
    doc.text('TRAVEL', MARGIN, y + 13);

    const xDer = PAGE_WIDTH - MARGIN;
    doc.setFontSize(7);
    doc.setTextColor(...TEXTO_PRIMARIO);
    let yAgent = y + 3;

    ['Cadastur: ', 'Agente: ', 'Teléfono: ', 'Email: '].forEach((label, i) => {
        const values = [datos.agente.cadastur, datos.agente.nombre, datos.agente.telefono, datos.agente.email];
        doc.setFont('helvetica', 'bold');
        doc.text(label, xDer - doc.getTextWidth(label + (values[i] || '')), yAgent);
        doc.setFont('helvetica', 'normal');
        doc.text(values[i] || '', xDer, yAgent, { align: 'right' });
        yAgent += 3.5;
    });

    y += 23;

    // 3. BARRA DESTINO
    const barraH = 14;
    const anchoNaranja = PAGE_WIDTH * 0.6;
    const anchoAzul = PAGE_WIDTH * 0.4;

    doc.setFillColor(...NARANJA);
    doc.rect(0, y, anchoNaranja, barraH, 'F');
    doc.setFillColor(...AZUL);
    doc.rect(anchoNaranja, y, anchoAzul, barraH, 'F');

    doc.setFillColor(...BLANCO);
    doc.triangle(anchoNaranja, y, anchoNaranja, y + barraH, anchoNaranja - 7, y + barraH, 'F');
    doc.triangle(anchoNaranja, y, anchoNaranja + 7, y, anchoNaranja, y + barraH, 'F');

    const primerVuelo = datos.vuelos[0] || {};
    const ultimoVuelo = datos.vuelos[datos.vuelos.length - 1] || primerVuelo;
    const origen = primerVuelo.origen || 'Origen';
    const destino = datos.cliente.destinoFinal || ultimoVuelo.destino || 'Destino';

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLANCO);
    doc.text(`${origen} - ${destino}`, MARGIN, y + 5);

    const pax = datos.cliente.cantidadPasajeros || 1;
    let subTexto = `${pax} adulto${pax > 1 ? 's' : ''}`;
    const servicios = [];
    if (datos.incluyeTransfer) servicios.push('Transfer');
    if (datos.incluyeSeguro) servicios.push('Seguro de Viaje');
    if (datos.incluyeVehiculo) servicios.push('Alquiler de Vehículo');
    if (servicios.length > 0) subTexto += ': ' + servicios.join(' + ');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subTexto, MARGIN, y + 11);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° ${(datos.presupuesto.numero || '00').toString().padStart(4, '0')}`, anchoNaranja + anchoAzul/2, y + 9, { align: 'center' });

    y += barraH + 4;

    // 4. DATOS CLIENTE
    doc.setFillColor(...NARANJA);
    doc.circle(MARGIN + 6, y + 6, 6, 'F');
    doc.setFillColor(...BLANCO);
    doc.circle(MARGIN + 6, y + 4, 2, 'F');
    doc.ellipse(MARGIN + 6, y + 8, 3, 2, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Datos del cliente', MARGIN + 17, y + 7);

    y += 15;
    doc.setFontSize(8);
    doc.setTextColor(...TEXTO_PRIMARIO);

    const col2X = PAGE_WIDTH / 2 + 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre: ', MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.cliente.nombre || '', MARGIN + doc.getTextWidth('Nombre: '), y);
    doc.setFont('helvetica', 'bold');
    doc.text('Ciudad: ', col2X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.cliente.ciudad || '', col2X + doc.getTextWidth('Ciudad: '), y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha: ', MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatearFecha(datos.presupuesto.fecha), MARGIN + doc.getTextWidth('Fecha: '), y);
    doc.setFont('helvetica', 'bold');
    doc.text('Teléfono: ', col2X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.cliente.telefono || '', col2X + doc.getTextWidth('Teléfono: '), y);

    y += 4;
    doc.setDrawColor(...BORDE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 4;

    // 5. VUELOS
    if (datos.vuelos.length > 0 && datos.vuelos.some(v => v.numero || v.origen)) {
        const fechas = datos.vuelos.filter(v => v.fecha).map(v => v.fecha).sort();
        const fIni = fechas[0] ? formatearFecha(fechas[0]) : '';
        const fFin = fechas[fechas.length-1] ? formatearFecha(fechas[fechas.length-1]) : fIni;

        doc.setFillColor(...NARANJA);
        doc.rect(0, y, PAGE_WIDTH, 8, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BLANCO);
        doc.text(`Trechos aéreos${fIni ? ` - ${fIni} al ${fFin}` : ''}`, MARGIN, y + 5.5);
        y += 12;

        datos.vuelos.forEach((v, idx) => {
            if (v.numero || v.origen) {
                const esVueloIda = v.tipo === 'ida' || !v.tipo;

                // Para vuelta, invertir origen/destino visualmente
                const izqCodigo = esVueloIda ? v.origen : v.destino;
                const izqHora = esVueloIda ? v.horaSalida : v.horaLlegada;
                const derCodigo = esVueloIda ? v.destino : v.origen;
                const derHora = esVueloIda ? v.horaLlegada : v.horaSalida;

                if (v.aerolinea) {
                    doc.setFillColor(...AZUL);
                    doc.roundedRect(MARGIN, y, 18, 4, 1, 1, 'F');
                    doc.setFontSize(5);
                    doc.setTextColor(...BLANCO);
                    doc.setFont('helvetica', 'bold');
                    doc.text(v.aerolinea.substring(0,8), MARGIN + 9, y + 2.8, { align: 'center' });
                }
                y += 6;

                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...TEXTO_PRIMARIO);
                doc.text(izqHora || '--:--', MARGIN + 25, y, { align: 'center' });
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...TEXTO_SECUNDARIO);
                doc.text(izqCodigo || '---', MARGIN + 25, y + 5, { align: 'center' });

                const xC = PAGE_WIDTH / 2;
                doc.text(v.duracion || '', xC, y - 3, { align: 'center' });

                doc.setDrawColor(...AZUL);
                doc.setLineWidth(0.5);
                doc.line(MARGIN + 45, y, xC, y);
                doc.setDrawColor(...NARANJA);
                doc.line(xC, y, PAGE_WIDTH - MARGIN - 45, y);

                doc.setFontSize(12);
                doc.setTextColor(...AZUL);
                doc.text('✈', esVueloIda ? PAGE_WIDTH - MARGIN - 50 : MARGIN + 50, y + 1);

                doc.setFontSize(7);
                doc.setTextColor(...NARANJA);
                doc.text(v.escalas || 'Directo', xC, y + 5, { align: 'center' });

                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...TEXTO_PRIMARIO);
                doc.text(derHora || '--:--', PAGE_WIDTH - MARGIN - 25, y, { align: 'center' });
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...TEXTO_SECUNDARIO);
                doc.text(derCodigo || '---', PAGE_WIDTH - MARGIN - 25, y + 5, { align: 'center' });

                y += 12;
            }
        });
        y += 2;
    }

    // 6. HOSPEDAJE
    if (datos.hoteles.length > 0 && datos.hoteles.some(h => h.nombre)) {
        doc.setFillColor(...NARANJA);
        doc.rect(0, y, PAGE_WIDTH, 8, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BLANCO);
        doc.text('Hospedaje', MARGIN, y + 5.5);
        y += 12;

        datos.hoteles.forEach(h => {
            if (h.nombre) {
                doc.setFillColor(...FONDO_CLARO);
                doc.setDrawColor(...BORDE);
                doc.roundedRect(MARGIN, y, 55, 35, 2, 2, 'FD');
                doc.setFontSize(7);
                doc.setTextColor(...TEXTO_SECUNDARIO);
                doc.text('Imagen del hotel', MARGIN + 27.5, y + 18, { align: 'center' });

                const xH = MARGIN + 60;
                doc.setFontSize(8);
                doc.setTextColor(...TEXTO_PRIMARIO);
                let yH = y + 6;

                [['Hotel: ', h.nombre], ['Cuarto: ', capitalizar(h.tipoCuarto)], ['Entrada: ', formatearFecha(h.fechaEntrada)], ['Salida: ', formatearFecha(h.fechaSalida)], ['Regimen: ', capitalizar(h.regimen)]].forEach(([lbl, val]) => {
                    doc.setFont('helvetica', 'bold');
                    doc.text(lbl, xH, yH);
                    doc.setFont('helvetica', 'normal');
                    doc.text(val || '', xH + doc.getTextWidth(lbl), yH);
                    yH += 6;
                });

                y += 39;
            }
        });
    }

    // 7. MÁS INFORMACIÓN
    y = Math.max(y + 5, 200);
    doc.setFillColor(...NARANJA);
    doc.rect(0, y, PAGE_WIDTH, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLANCO);
    doc.text('Más información', MARGIN, y + 5.5);
    y += 11;

    // Cotización
    doc.setFillColor(37, 99, 75);
    doc.roundedRect(MARGIN, y, 10, 7, 1, 1, 'F');
    doc.setFontSize(6);
    doc.setTextColor(...BLANCO);
    doc.text('$', MARGIN + 5, y + 4.5, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(...TEXTO_PRIMARIO);
    doc.setFont('helvetica', 'bold');
    doc.text('Cotización: ', MARGIN + 13, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.text('Precio referido a dólar billete, caso el pago sea realizado en pesos', MARGIN + 13 + doc.getTextWidth('Cotización: '), y + 3);
    doc.text('argentinos, deberá ser considerado el valor referente al tipo de cambio del día.', MARGIN + 13, y + 7);

    y += 12;

    // Plazo
    doc.setFillColor(...NARANJA);
    doc.roundedRect(MARGIN, y, 10, 7, 1, 1, 'F');
    doc.setFontSize(5);
    doc.setTextColor(...BLANCO);
    doc.text('CAL', MARGIN + 5, y + 4.5, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(...TEXTO_PRIMARIO);
    doc.setFont('helvetica', 'bold');
    doc.text('Plazo de la propuesta: ', MARGIN + 13, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.text('Las tarifas seleccionadas están sujetas a disponibilidad y pueden', MARGIN + 13 + doc.getTextWidth('Plazo de la propuesta: '), y + 3);
    doc.text('cambiar sin previo aviso. Solo la emisión del voucher garantiza la tarifa.', MARGIN + 13, y + 7);

    // 8. VALORES
    const monedaSym = datos.moneda === 'BRL' ? 'R$' : 'U$D';
    const valorPP = formatearNumero(datos.valores.porPersona);
    const valorTot = formatearNumero(datos.valores.total);
    const yVal = PAGE_HEIGHT - 24 - 12;

    doc.setFontSize(9);
    const txtTotal = `VALOR TOTAL: ${monedaSym} ${valorTot}`;
    const anchoBox = doc.getTextWidth(txtTotal) + 8;

    doc.setFillColor(...NARANJA);
    doc.rect(PAGE_WIDTH - anchoBox, yVal, anchoBox, 12, 'F');
    doc.setTextColor(...BLANCO);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`VALOR POR PERSONA: ${monedaSym} ${valorPP}`, PAGE_WIDTH - 3, yVal + 4, { align: 'right' });
    doc.setFontSize(9);
    doc.text(txtTotal, PAGE_WIDTH - 3, yVal + 9, { align: 'right' });

    // 9. BARRA AZUL BOTTOM
    doc.setFillColor(...AZUL);
    doc.rect(0, PAGE_HEIGHT - 4, PAGE_WIDTH, 4, 'F');

    // GUARDAR
    const nombre = `presupuesto_${datos.presupuesto.numero || 'sin-numero'}_${datos.cliente.nombre || 'cliente'}.pdf`.replace(/\s+/g, '_');
    doc.save(nombre);

    if (typeof showToast === 'function') {
        showToast('PDF exportado (jsPDF fallback)');
    }
    console.log('=== PDF EXPORTADO (JSPDF) ===');
}

function formatearNumero(valor) {
    if (!valor) return '0';
    return new Intl.NumberFormat('es-AR').format(parseFloat(valor));
}

function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
