// Generador PDF con jsPDF - Reemplaza Puppeteer para uso en navegador
// Incluye imágenes, traducciones y layout completo

class PDFGenerator {
    constructor() {
        this.PAGE_WIDTH = 210;
        this.PAGE_HEIGHT = 297;
        this.MARGIN = 10;

        this.COLORS = {
            naranja: [237, 110, 26],
            azul: [67, 92, 145],
            textoPrimario: [30, 41, 59],
            textoSecundario: [100, 116, 139],
            borde: [226, 232, 240],
            blanco: [255, 255, 255],
            fondoClaro: [244, 244, 244]
        };

        // Cache de imágenes en base64
        this.imagenesCache = {};
        this.imagenesCargadas = false;
    }

    // Pre-cargar imágenes como base64
    async precargarImagenes() {
        if (this.imagenesCargadas) return;

        const imagenes = ['Logo.png', 'Usuario.png', 'Cotizacion.png', 'Plazo.png'];

        for (const img of imagenes) {
            try {
                this.imagenesCache[img] = await this.cargarImagenBase64(`/assets/${img}`);
            } catch (e) {
                console.warn(`No se pudo cargar ${img}:`, e);
            }
        }

        this.imagenesCargadas = true;
    }

    cargarImagenBase64(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => reject(new Error(`No se pudo cargar: ${url}`));
            img.src = url;
        });
    }

    // Traducciones
    getTraducciones(idioma = 'es') {
        const TRADUCCIONES = {
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
                desayuno: 'Desayuno',
                tarifa: 'Tarifa'
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
                desayuno: 'Café da Manhã',
                tarifa: 'Tarifa'
            }
        };

        return TRADUCCIONES[idioma] || TRADUCCIONES['es'];
    }

    // Formatear tarifa
    formatearTarifa(tarifa, idioma = 'es') {
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
    }

    async generarPDF(datos) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Precargar imágenes
        await this.precargarImagenes();

        const t = this.getTraducciones(datos.idioma || 'es');
        let y = 0;

        // 1. BARRA AZUL TOP
        doc.setFillColor(...this.COLORS.azul);
        doc.rect(0, 0, this.PAGE_WIDTH, 4, 'F');
        y = 4;

        // 2. HEADER
        y = this.dibujarHeader(doc, datos, t, y);

        // 3. BARRA DESTINO
        y = this.dibujarBarraDestino(doc, datos, t, y);

        // 4. DATOS CLIENTE
        y = this.dibujarDatosCliente(doc, datos, t, y);

        // 5. VUELOS
        if (datos.vuelos?.length > 0 && datos.vuelos.some(v => v.numero || v.origen)) {
            y = this.dibujarVuelos(doc, datos, t, y);
        }

        // 6. HOSPEDAJE
        if (datos.hoteles?.length > 0 && datos.hoteles.some(h => h.nombre)) {
            y = this.dibujarHoteles(doc, datos, t, y);
        }

        // 7. MÁS INFORMACIÓN
        y = this.dibujarMasInfo(doc, datos, t, y);

        // 8. VALORES
        this.dibujarValores(doc, datos, t);

        // 9. BARRA AZUL BOTTOM
        doc.setFillColor(...this.COLORS.azul);
        doc.rect(0, this.PAGE_HEIGHT - 4, this.PAGE_WIDTH, 4, 'F');

        // Guardar
        const nombre = `presupuesto_${datos.presupuesto?.numero || 'sin-numero'}_${datos.cliente?.nombre || 'cliente'}.pdf`.replace(/\s+/g, '_');
        doc.save(nombre);

        return nombre;
    }

    dibujarHeader(doc, datos, t, y) {
        y += 5;

        // Logo
        if (this.imagenesCache['Logo.png']) {
            try {
                doc.addImage(this.imagenesCache['Logo.png'], 'PNG', this.MARGIN, y, 40, 12);
            } catch (e) {
                this.dibujarLogoFallback(doc, y);
            }
        } else {
            this.dibujarLogoFallback(doc, y);
        }

        // Datos agente (derecha)
        const xDer = this.PAGE_WIDTH - this.MARGIN;
        doc.setFontSize(7);
        let yAgent = y + 2;

        const agente = datos.agente || {};

        // Cadastur
        if (agente.cadastur) {
            doc.setTextColor(...this.COLORS.textoSecundario);
            doc.setFont('helvetica', 'normal');
            doc.text(`Cadastur: ${agente.cadastur}`, xDer, yAgent, { align: 'right' });
            yAgent += 3;
        }

        // Agente
        doc.setTextColor(...this.COLORS.textoPrimario);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t.agente}: `, xDer - doc.getTextWidth(agente.nombre || ''), yAgent);
        doc.setFont('helvetica', 'normal');
        doc.text(agente.nombre || '', xDer, yAgent, { align: 'right' });
        yAgent += 3;

        // Teléfono
        if (agente.telefono) {
            doc.setFont('helvetica', 'bold');
            const telLabel = `${t.telefono}: `;
            doc.text(telLabel, xDer - doc.getTextWidth(agente.telefono), yAgent);
            doc.setFont('helvetica', 'normal');
            doc.text(agente.telefono, xDer, yAgent, { align: 'right' });
            yAgent += 3;
        }

        // Email
        if (agente.email) {
            doc.setFont('helvetica', 'bold');
            doc.text(`${t.email}: `, xDer - doc.getTextWidth(agente.email), yAgent);
            doc.setFont('helvetica', 'normal');
            doc.text(agente.email, xDer, yAgent, { align: 'right' });
        }

        return y + 18;
    }

    dibujarLogoFallback(doc, y) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.COLORS.naranja);
        doc.text('FREEST', this.MARGIN, y + 6);
        doc.setFontSize(8);
        doc.setTextColor(...this.COLORS.azul);
        doc.text('TRAVEL', this.MARGIN, y + 10);
    }

    dibujarBarraDestino(doc, datos, t, y) {
        const barraH = 14;
        const anchoNaranja = this.PAGE_WIDTH * 0.6;

        // Fondo naranja
        doc.setFillColor(...this.COLORS.naranja);
        doc.rect(0, y, anchoNaranja + 5, barraH, 'F');

        // Fondo azul
        doc.setFillColor(...this.COLORS.azul);
        doc.rect(anchoNaranja - 5, y, this.PAGE_WIDTH - anchoNaranja + 10, barraH, 'F');

        // Diagonal blanca (simulada con triángulo)
        doc.setFillColor(...this.COLORS.blanco);
        const diagX = anchoNaranja;
        doc.triangle(
            diagX - 4, y,
            diagX + 4, y,
            diagX - 4, y + barraH,
            'F'
        );
        doc.triangle(
            diagX + 4, y,
            diagX + 4, y + barraH,
            diagX - 4, y + barraH,
            'F'
        );

        // Texto destino
        const primerVuelo = datos.vuelos?.[0] || {};
        const origen = primerVuelo.origen || '';
        const destino = datos.cliente?.destinoFinal || primerVuelo.destino || '';

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.COLORS.blanco);

        const destinoTexto = origen && destino ? `${origen} - ${destino}` : destino || 'Destino';
        doc.text(destinoTexto, this.MARGIN, y + 5);

        // Subtexto (pasajeros + servicios)
        const pax = datos.cliente?.cantidadPasajeros || 1;
        let subTexto = `${pax} ${pax > 1 ? t.adultos : t.adulto}`;

        const servicios = [];
        if (datos.incluyeTransfer) servicios.push(t.transfer);
        if (datos.incluyeSeguro) servicios.push(t.seguroViaje);
        if (datos.incluyeVehiculo) servicios.push(t.alquilerVehiculo);
        if (servicios.length > 0) subTexto += ': ' + servicios.join(' + ');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(subTexto, this.MARGIN, y + 10);

        // Número de presupuesto (derecha)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const numero = (datos.presupuesto?.numero || '00').toString().padStart(4, '0');
        doc.text(`N° ${numero}`, this.PAGE_WIDTH - this.MARGIN, y + 8, { align: 'right' });

        return y + barraH + 4;
    }

    dibujarDatosCliente(doc, datos, t, y) {
        // Icono usuario
        if (this.imagenesCache['Usuario.png']) {
            try {
                doc.addImage(this.imagenesCache['Usuario.png'], 'PNG', this.MARGIN, y, 10, 10);
            } catch (e) {
                doc.setFillColor(...this.COLORS.naranja);
                doc.circle(this.MARGIN + 5, y + 5, 5, 'F');
            }
        } else {
            doc.setFillColor(...this.COLORS.naranja);
            doc.circle(this.MARGIN + 5, y + 5, 5, 'F');
        }

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.COLORS.textoPrimario);
        doc.text(t.datosCliente, this.MARGIN + 13, y + 6);

        y += 14;

        const cliente = datos.cliente || {};
        const presupuesto = datos.presupuesto || {};

        doc.setFontSize(8);
        const col2X = 110;

        // Fila 1: Nombre y Ciudad
        this.dibujarCampo(doc, t.nombre, cliente.nombre, this.MARGIN, y);
        this.dibujarCampo(doc, t.ciudad, cliente.ciudad, col2X, y, 'right');
        y += 5;

        // Fila 2: Fecha y Teléfono
        const fechaFormateada = this.formatearFecha(presupuesto.fecha);
        this.dibujarCampo(doc, t.fecha, fechaFormateada, this.MARGIN, y);
        this.dibujarCampo(doc, t.telefono, cliente.telefono, col2X, y, 'right');
        y += 4;

        // Separador
        doc.setDrawColor(...this.COLORS.borde);
        doc.setLineWidth(0.3);
        doc.line(this.MARGIN, y, this.PAGE_WIDTH - this.MARGIN, y);

        return y + 4;
    }

    dibujarCampo(doc, label, value, x, y, align = 'left') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.COLORS.textoPrimario);
        const labelText = `${label}: `;
        doc.text(labelText, x, y);
        doc.setFont('helvetica', 'normal');

        if (align === 'right') {
            doc.text(value || '', this.PAGE_WIDTH - this.MARGIN, y, { align: 'right' });
        } else {
            doc.text(value || '', x + doc.getTextWidth(labelText), y);
        }
    }

    dibujarVuelos(doc, datos, t, y) {
        // Calcular fechas
        const fechas = datos.vuelos.filter(v => v.fecha).map(v => v.fecha).sort();
        const fIni = fechas[0] ? this.formatearFecha(fechas[0]) : '';
        const fFin = fechas[fechas.length - 1] ? this.formatearFecha(fechas[fechas.length - 1]) : fIni;
        const fechasTexto = fIni === fFin ? fIni : `${fIni} ${t.al} ${fFin}`;

        // Barra título
        doc.setFillColor(...this.COLORS.naranja);
        doc.rect(0, y, this.PAGE_WIDTH, 7, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.COLORS.blanco);
        doc.text(`${t.trechosAereos}${fIni ? ` - ${fechasTexto}` : ''}`, this.MARGIN, y + 5);

        // Tarifa (si existe)
        const tarifaInfo = this.formatearTarifa(datos.presupuesto?.tipoTarifa, datos.idioma || 'es');
        if (tarifaInfo) {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text(`${t.tarifa}: ${tarifaInfo.nombre} (${tarifaInfo.descripcion})`, this.PAGE_WIDTH - this.MARGIN, y + 5, { align: 'right' });
        }

        y += 10;

        // Dibujar cada vuelo
        datos.vuelos.forEach((v) => {
            if (v.numero || v.origen || v.destino) {
                const esIda = v.tipo === 'ida' || !v.tipo;

                // Badge aerolínea
                if (v.aerolinea) {
                    doc.setFillColor(...this.COLORS.azul);
                    doc.roundedRect(this.MARGIN, y - 1, 20, 5, 1, 1, 'F');
                    doc.setFontSize(6);
                    doc.setTextColor(...this.COLORS.blanco);
                    doc.setFont('helvetica', 'bold');
                    doc.text(v.aerolinea.substring(0, 10).toUpperCase(), this.MARGIN + 10, y + 2.5, { align: 'center' });
                }
                y += 7;

                // Configuración según tipo de vuelo
                const izqHora = esIda ? v.horaSalida : v.horaLlegada;
                const izqCodigo = esIda ? v.origen : v.destino;
                const derHora = esIda ? v.horaLlegada : v.horaSalida;
                const derCodigo = esIda ? v.destino : v.origen;

                // Hora izquierda
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...this.COLORS.textoPrimario);
                doc.text(izqHora || '--:--', 35, y, { align: 'center' });
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...this.COLORS.textoSecundario);
                doc.text(izqCodigo || '---', 35, y + 5, { align: 'center' });

                // Centro: duración y línea
                const xC = this.PAGE_WIDTH / 2;

                // Duración arriba
                doc.setFontSize(7);
                doc.setTextColor(...this.COLORS.textoSecundario);
                doc.text(v.duracion || '', xC, y - 4, { align: 'center' });

                // Línea con gradiente (simulado)
                doc.setDrawColor(...this.COLORS.azul);
                doc.setLineWidth(0.8);
                doc.line(55, y, xC - 5, y);
                doc.setDrawColor(...this.COLORS.naranja);
                doc.line(xC + 5, y, this.PAGE_WIDTH - 55, y);

                // Avión (usando emoji o texto)
                doc.setFontSize(10);
                doc.setTextColor(...this.COLORS.naranja);
                const avion = esIda ? '>' : '<';
                doc.text(avion, xC, y + 1, { align: 'center' });

                // Escalas
                doc.setFontSize(7);
                doc.setTextColor(...this.COLORS.naranja);
                const escalasTexto = (!v.escalas || v.escalas.toLowerCase() === 'directo') ? t.directo : '';
                if (escalasTexto) {
                    doc.text(escalasTexto, xC, y + 5, { align: 'center' });
                }

                // Hora derecha
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...this.COLORS.textoPrimario);
                doc.text(derHora || '--:--', this.PAGE_WIDTH - 35, y, { align: 'center' });

                // Indicador +1 si llega al día siguiente
                if (izqHora && derHora && derHora < izqHora) {
                    doc.setFontSize(7);
                    doc.setTextColor(...this.COLORS.naranja);
                    doc.text('+1', this.PAGE_WIDTH - 20, y - 3);
                }

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...this.COLORS.textoSecundario);
                doc.text(derCodigo || '---', this.PAGE_WIDTH - 35, y + 5, { align: 'center' });

                y += 12;
            }
        });

        return y + 2;
    }

    dibujarHoteles(doc, datos, t, y) {
        // Barra título
        doc.setFillColor(...this.COLORS.naranja);
        doc.rect(0, y, this.PAGE_WIDTH, 7, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.COLORS.blanco);
        doc.text(t.hospedaje, this.MARGIN, y + 5);
        y += 10;

        const hotelesValidos = datos.hoteles.filter(h => h.nombre);
        const anchoHotel = hotelesValidos.length === 1 ? this.PAGE_WIDTH - 2 * this.MARGIN : (this.PAGE_WIDTH - 2 * this.MARGIN - 5) / 2;

        hotelesValidos.forEach((h, index) => {
            const xBase = this.MARGIN + (index % 2) * (anchoHotel + 5);
            const yBase = y + Math.floor(index / 2) * 42;

            // Placeholder imagen
            const imgWidth = 45;
            const imgHeight = 32;

            doc.setFillColor(...this.COLORS.fondoClaro);
            doc.setDrawColor(...this.COLORS.borde);
            doc.roundedRect(xBase, yBase, imgWidth, imgHeight, 2, 2, 'FD');

            // Intentar cargar imagen del hotel
            if (h.imagen) {
                try {
                    doc.addImage(h.imagen, 'JPEG', xBase + 1, yBase + 1, imgWidth - 2, imgHeight - 2);
                } catch (e) {
                    doc.setFontSize(6);
                    doc.setTextColor(...this.COLORS.textoSecundario);
                    doc.text('Imagen', xBase + imgWidth / 2, yBase + imgHeight / 2, { align: 'center' });
                }
            }

            // Datos del hotel
            const xH = xBase + imgWidth + 3;
            let yH = yBase + 5;

            doc.setFontSize(7);

            // Hotel (con link si hay URL)
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...this.COLORS.textoPrimario);
            doc.text(`${t.hotel}: `, xH, yH);
            if (h.url) {
                doc.setTextColor(...this.COLORS.azul);
            }
            doc.setFont('helvetica', 'normal');
            doc.text((h.nombre || '').substring(0, 25), xH + doc.getTextWidth(`${t.hotel}: `), yH);
            yH += 5;

            // Cuarto
            doc.setTextColor(...this.COLORS.textoPrimario);
            doc.setFont('helvetica', 'bold');
            doc.text(`${t.cuarto}: `, xH, yH);
            doc.setFont('helvetica', 'normal');
            doc.text(this.capitalizar(h.tipoCuarto) || '', xH + doc.getTextWidth(`${t.cuarto}: `), yH);
            yH += 5;

            // Entrada
            doc.setFont('helvetica', 'bold');
            doc.text(`${t.entrada}: `, xH, yH);
            doc.setFont('helvetica', 'normal');
            doc.text(this.formatearFecha(h.fechaEntrada), xH + doc.getTextWidth(`${t.entrada}: `), yH);
            yH += 5;

            // Salida
            doc.setFont('helvetica', 'bold');
            doc.text(`${t.salida}: `, xH, yH);
            doc.setFont('helvetica', 'normal');
            doc.text(this.formatearFecha(h.fechaSalida), xH + doc.getTextWidth(`${t.salida}: `), yH);
            yH += 5;

            // Régimen
            doc.setFont('helvetica', 'bold');
            doc.text(`${t.regimen}: `, xH, yH);
            doc.setFont('helvetica', 'normal');
            doc.text(this.formatearRegimen(h.regimen, t) || '', xH + doc.getTextWidth(`${t.regimen}: `), yH);
        });

        const filas = Math.ceil(hotelesValidos.length / 2);
        return y + filas * 42 + 2;
    }

    dibujarMasInfo(doc, datos, t, y) {
        // Asegurar espacio mínimo
        y = Math.max(y + 5, 200);

        // Barra título
        doc.setFillColor(...this.COLORS.naranja);
        doc.rect(0, y, this.PAGE_WIDTH, 7, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.COLORS.blanco);
        doc.text(t.masInfo, this.MARGIN, y + 5);
        y += 10;

        const maxWidth = this.PAGE_WIDTH - this.MARGIN * 2 - 15;

        // Cotización
        if (this.imagenesCache['Cotizacion.png']) {
            try {
                doc.addImage(this.imagenesCache['Cotizacion.png'], 'PNG', this.MARGIN, y, 8, 8);
            } catch (e) {
                this.dibujarIconoFallback(doc, this.MARGIN, y, [37, 99, 75], '$');
            }
        } else {
            this.dibujarIconoFallback(doc, this.MARGIN, y, [37, 99, 75], '$');
        }

        doc.setFontSize(7);
        doc.setTextColor(...this.COLORS.textoPrimario);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t.cotizacion}:`, this.MARGIN + 11, y + 3);
        doc.setFont('helvetica', 'normal');
        const cotLines = doc.splitTextToSize(t.cotizacionTexto, maxWidth);
        doc.text(cotLines, this.MARGIN + 11, y + 7);

        y += 12 + (cotLines.length - 1) * 3;

        // Plazo
        if (this.imagenesCache['Plazo.png']) {
            try {
                doc.addImage(this.imagenesCache['Plazo.png'], 'PNG', this.MARGIN, y, 8, 8);
            } catch (e) {
                this.dibujarIconoFallback(doc, this.MARGIN, y, this.COLORS.naranja, '!');
            }
        } else {
            this.dibujarIconoFallback(doc, this.MARGIN, y, this.COLORS.naranja, '!');
        }

        doc.setFont('helvetica', 'bold');
        doc.text(`${t.plazo}:`, this.MARGIN + 11, y + 3);
        doc.setFont('helvetica', 'normal');
        const plazoLines = doc.splitTextToSize(t.plazoTexto, maxWidth);
        doc.text(plazoLines, this.MARGIN + 11, y + 7);

        return y + 12;
    }

    dibujarIconoFallback(doc, x, y, color, texto) {
        doc.setFillColor(...color);
        doc.roundedRect(x, y, 8, 8, 2, 2, 'F');
        doc.setFontSize(6);
        doc.setTextColor(...this.COLORS.blanco);
        doc.setFont('helvetica', 'bold');
        doc.text(texto, x + 4, y + 5.5, { align: 'center' });
    }

    dibujarValores(doc, datos, t) {
        const monedaSym = datos.moneda === 'BRL' ? 'R$' : 'USD';
        const valorPP = this.formatearNumero(datos.valores?.porPersona);
        const valorTot = this.formatearNumero(datos.valores?.total);

        // Posición fija desde el fondo
        const yVal = this.PAGE_HEIGHT - 28;

        // Calcular ancho del box
        doc.setFontSize(10);
        const txtTotal = `${t.valorTotal}: ${monedaSym} ${valorTot}`;
        const anchoBox = Math.max(doc.getTextWidth(txtTotal) + 15, 70);

        // Box naranja
        doc.setFillColor(...this.COLORS.naranja);
        doc.rect(this.PAGE_WIDTH - anchoBox - this.MARGIN, yVal, anchoBox, 16, 'F');

        // Textos
        doc.setTextColor(...this.COLORS.blanco);

        // Valor por persona
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`${t.valorPorPersona}: ${monedaSym} ${valorPP}`, this.PAGE_WIDTH - this.MARGIN - 3, yVal + 5, { align: 'right' });

        // Valor total
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(txtTotal, this.PAGE_WIDTH - this.MARGIN - 3, yVal + 12, { align: 'right' });
    }

    // Utilidades
    formatearFecha(fecha) {
        if (!fecha) return '';
        try {
            const d = new Date(fecha + 'T00:00:00');
            return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return fecha;
        }
    }

    formatearNumero(valor) {
        if (!valor) return '0';
        try {
            return new Intl.NumberFormat('es-AR').format(parseFloat(valor));
        } catch {
            return String(valor);
        }
    }

    capitalizar(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatearRegimen(regimen, t) {
        if (!regimen) return '';
        const mapeo = {
            'mediaPension': t.mediaPension,
            'pensionCompleta': t.pensionCompleta,
            'todoIncluido': t.todoIncluido,
            'soloAlojamiento': t.soloAlojamiento,
            'desayuno': t.desayuno
        };
        return mapeo[regimen] || this.capitalizar(regimen);
    }
}

// Instancia global
window.pdfGenerator = new PDFGenerator();

// Función wrapper para compatibilidad con código existente
async function exportarPDF() {
    console.log('=== GENERANDO PDF CON jsPDF ===');

    try {
        // Validar formulario
        if (typeof validarFormulario === 'function') {
            const esValido = validarFormulario();
            if (!esValido) {
                console.log('Formulario inválido');
                return;
            }
        }

        const datos = recolectarDatos();
        console.log('Datos:', datos);

        if (typeof showToast === 'function') {
            showToast('Generando PDF...', 'info');
        }

        await window.pdfGenerator.generarPDF(datos);

        if (typeof showToast === 'function') {
            showToast('PDF exportado correctamente', 'success');
        }

        console.log('=== PDF GENERADO ===');

    } catch (error) {
        console.error('Error generando PDF:', error);
        if (typeof mostrarErrorAmigable === 'function') {
            mostrarErrorAmigable(error.message);
        } else if (typeof showToast === 'function') {
            showToast('Error al generar PDF', 'error');
        }
    }
}
