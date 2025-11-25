// Servidor Express para generar PDFs con Puppeteer
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { generarPDF } = require('./js/pdf-puppeteer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));


// Endpoint de TEST - datos fijos para probar
app.get('/api/test-pdf', async (req, res) => {
    try {
        const datos = {
            "agente": {
                "nombre": "Franco",
                "email": "contatofreest@gmail.com",
                "cadastur": "37.286.620/0001-49",
                "telefono": "21212312313"
            },
            "cliente": {
                "nombre": "Braian Axel Troncoso",
                "telefono": "12312313",
                "ciudad": "Cordoba",
                "destinoFinal": "Jericoacoara",
                "cantidadPasajeros": "2"
            },
            "presupuesto": {
                "numero": "10",
                "fecha": "2025-11-24",
                "tipoViaje": "idaVuelta"
            },
            "vuelos": [
                {
                    "tipo": "ida",
                    "numero": "LA8049",
                    "origen": "COR",
                    "destino": "GRU",
                    "fecha": "2025-12-03",
                    "horaSalida": "11:00",
                    "horaLlegada": "14:35",
                    "aerolinea": "LATAM",
                    "duracion": "3h 35m",
                    "escalas": "Directo"
                },
                {
                    "tipo": "ida",
                    "numero": "LA3324",
                    "origen": "GRU",
                    "destino": "FOR",
                    "fecha": "2025-12-03",
                    "horaSalida": "23:35",
                    "horaLlegada": "02:55",
                    "aerolinea": "LATAM",
                    "duracion": "3h 20m",
                    "escalas": "Directo"
                },
                {
                    "tipo": "vuelta",
                    "numero": "LA3319",
                    "origen": "FOR",
                    "destino": "GRU",
                    "fecha": "2025-12-10",
                    "horaSalida": "16:30",
                    "horaLlegada": "20:00",
                    "aerolinea": "LATAM",
                    "duracion": "3h 30m",
                    "escalas": "Directo"
                },
                {
                    "tipo": "vuelta",
                    "numero": "LA8050",
                    "origen": "GRU",
                    "destino": "COR",
                    "fecha": "2025-12-11",
                    "horaSalida": "13:00",
                    "horaLlegada": "16:30",
                    "aerolinea": "LATAM",
                    "duracion": "3h 30m",
                    "escalas": "Directo"
                }
            ],
            "hoteles": [
                {
                    "nombre": "Hotel Jeri",
                    "url": "https://github.com/tincke10/FrestPresupuesto",
                    "tipoCuarto": "doble",
                    "fechaEntrada": "2025-12-03",
                    "fechaSalida": "2025-12-10",
                    "noches": "7",
                    "regimen": "Desayuno"
                }
            ],
            "incluyeTransfer": false,
            "incluyeSeguro": true,
            "incluyeVehiculo": true,
            "moneda": "USD",
            "valores": {
                "porPersona": "700",
                "total": "1400.00"
            }
        };

        console.log('=== TEST PDF ===');
        console.log('Vuelos:');
        datos.vuelos.forEach((v, i) => {
            console.log(`  ${i+1}. ${v.tipo.toUpperCase()}: ${v.origen} → ${v.destino}`);
        });

        const nombreArchivo = `test_presupuesto.pdf`;
        const outputPath = path.join(__dirname, 'temp', nombreArchivo);

        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        await generarPDF(datos, outputPath);

        res.download(outputPath, nombreArchivo, (err) => {
            if (err) {
                console.error('Error enviando PDF:', err);
            }
        });

    } catch (error) {
        console.error('Error generando PDF test:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint de TEST 2 - Porto Seguro
app.get('/api/test-pdf-2', async (req, res) => {
    try {
        const datos = {
            "agente": {
                "nombre": "Franco",
                "email": "contatofreest@gmail.com",
                "cadastur": "37.286.620/0001-49",
                "telefono": "123123123"
            },
            "cliente": {
                "nombre": "Braian Axel Troncoso",
                "telefono": "12312313",
                "ciudad": "Cordoba",
                "destinoFinal": "Puerto Seguro",
                "cantidadPasajeros": "2"
            },
            "presupuesto": {
                "numero": "17",
                "fecha": "2025-11-25",
                "tipoViaje": "idaVuelta"
            },
            "vuelos": [
                {
                    "tipo": "ida",
                    "numero": "G37615",
                    "origen": "Córdoba (COR)",
                    "destino": "São Paulo (GRU)",
                    "fecha": "2025-12-02",
                    "horaSalida": "04:05",
                    "horaLlegada": "07:10",
                    "aerolinea": "Gol",
                    "duracion": "3h 5m",
                    "escalas": "Directo"
                },
                {
                    "tipo": "ida",
                    "numero": "G31650",
                    "origen": "São Paulo (GRU)",
                    "destino": "Porto Seguro (BPS)",
                    "fecha": "2025-12-02",
                    "horaSalida": "16:00",
                    "horaLlegada": "17:55",
                    "aerolinea": "Gol",
                    "duracion": "1h 55m",
                    "escalas": "Directo"
                },
                {
                    "tipo": "vuelta",
                    "numero": "G32049",
                    "origen": "Porto Seguro (BPS)",
                    "destino": "Rio de Janeiro (GIG)",
                    "fecha": "2025-12-09",
                    "horaSalida": "15:30",
                    "horaLlegada": "17:00",
                    "aerolinea": "Gol",
                    "duracion": "1h 30m",
                    "escalas": "Directo"
                },
                {
                    "tipo": "vuelta",
                    "numero": "G37612",
                    "origen": "Rio de Janeiro (GIG)",
                    "destino": "Córdoba (COR)",
                    "fecha": "2025-12-09",
                    "horaSalida": "21:25",
                    "horaLlegada": "01:15",
                    "aerolinea": "Gol",
                    "duracion": "3h 50m",
                    "escalas": "1 escala(s)"
                }
            ],
            "hoteles": [
                {
                    "nombre": "Hotel Porto Seguro",
                    "url": "",
                    "tipoCuarto": "doble",
                    "fechaEntrada": "2025-12-03",
                    "fechaSalida": "2025-12-10",
                    "noches": "7",
                    "regimen": ""
                }
            ],
            "incluyeTransfer": true,
            "incluyeSeguro": true,
            "incluyeVehiculo": false,
            "moneda": "USD",
            "valores": {
                "porPersona": "600",
                "total": "1200.00"
            }
        };

        console.log('=== TEST PDF 2 - Porto Seguro ===');
        console.log('Vuelos:');
        datos.vuelos.forEach((v, i) => {
            console.log(`  ${i+1}. ${v.tipo.toUpperCase()}: ${v.origen} → ${v.destino} (${v.horaSalida}-${v.horaLlegada})`);
        });

        const nombreArchivo = `test_presupuesto_2.pdf`;
        const outputPath = path.join(__dirname, 'temp', nombreArchivo);

        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        await generarPDF(datos, outputPath);

        res.download(outputPath, nombreArchivo, (err) => {
            if (err) {
                console.error('Error enviando PDF:', err);
            }
        });

    } catch (error) {
        console.error('Error generando PDF test 2:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint de TEST 3 - San Andrés (con vuelo que llega al día siguiente)
app.get('/api/test-pdf-3', async (req, res) => {
    try {
        const datos = {
            "agente": {
                "nombre": "Franco",
                "email": "contatofreest@gmail.com",
                "cadastur": "37.286.620/0001-49",
                "telefono": "21212312313"
            },
            "cliente": {
                "nombre": "Braian Axel Troncoso",
                "telefono": "12312313",
                "ciudad": "Cordoba",
                "destinoFinal": "San Andres",
                "cantidadPasajeros": "2"
            },
            "presupuesto": {
                "numero": "19",
                "fecha": "2025-11-25",
                "tipoViaje": "idaVuelta"
            },
            "vuelos": [
                {
                    "tipo": "ida",
                    "numero": "CM509",
                    "origen": "Córdoba (COR)",
                    "destino": "Tocumen (PTY)",
                    "fecha": "2025-12-16",
                    "horaSalida": "02:00",
                    "horaLlegada": "06:36",
                    "aerolinea": "Copa Airlines",
                    "duracion": "6h 36m",
                    "escalas": "Directo"
                },
                {
                    "tipo": "ida",
                    "numero": "CM230",
                    "origen": "Tocumen (PTY)",
                    "destino": "San Andrés (ADZ)",
                    "fecha": "2025-12-16",
                    "horaSalida": "07:25",
                    "horaLlegada": "08:42",
                    "aerolinea": "Copa Airlines",
                    "duracion": "1h 17m",
                    "escalas": "Directo"
                },
                {
                    "tipo": "vuelta",
                    "numero": "CM231",
                    "origen": "San Andrés (ADZ)",
                    "destino": "Tocumen (PTY)",
                    "fecha": "2025-12-23",
                    "horaSalida": "09:38",
                    "horaLlegada": "10:59",
                    "aerolinea": "Copa Airlines",
                    "duracion": "1h 21m",
                    "escalas": "Directo"
                },
                {
                    "tipo": "vuelta",
                    "numero": "CM508",
                    "origen": "Tocumen (PTY)",
                    "destino": "Córdoba (COR)",
                    "fecha": "2025-12-23",
                    "horaSalida": "15:40",
                    "horaLlegada": "00:21",
                    "aerolinea": "Copa Airlines",
                    "duracion": "6h 41m",
                    "escalas": "Directo"
                }
            ],
            "hoteles": [
                {
                    "nombre": "Hotel Andres",
                    "url": "",
                    "tipoCuarto": "doble",
                    "fechaEntrada": "2025-12-16",
                    "fechaSalida": "2025-12-23",
                    "noches": "7",
                    "regimen": ""
                }
            ],
            "incluyeTransfer": true,
            "incluyeSeguro": true,
            "incluyeVehiculo": false,
            "moneda": "USD",
            "valores": {
                "porPersona": "1000",
                "total": "2000.00"
            }
        };

        console.log('=== TEST PDF 3 - San Andrés ===');
        console.log('Vuelos:');
        datos.vuelos.forEach((v, i) => {
            const llegaSiguiente = v.horaLlegada < v.horaSalida ? ' (+1)' : '';
            console.log(`  ${i+1}. ${v.tipo.toUpperCase()}: ${v.origen} → ${v.destino} (${v.horaSalida}-${v.horaLlegada}${llegaSiguiente})`);
        });

        const nombreArchivo = `test_presupuesto_3.pdf`;
        const outputPath = path.join(__dirname, 'temp', nombreArchivo);

        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        await generarPDF(datos, outputPath);

        res.download(outputPath, nombreArchivo, (err) => {
            if (err) {
                console.error('Error enviando PDF:', err);
            }
        });

    } catch (error) {
        console.error('Error generando PDF test 3:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint de TEST 4 - Solo ida + URL hotel + Media Pensión + Imagen
app.get('/api/test-pdf-4', async (req, res) => {
    try {
        // Cargar imagen del hotel como base64
        const imagenPath = path.join(__dirname, 'assets', 'image-to-test.jpg');
        let imagenBase64 = '';
        if (fs.existsSync(imagenPath)) {
            const imagenData = fs.readFileSync(imagenPath);
            imagenBase64 = `data:image/jpeg;base64,${imagenData.toString('base64')}`;
        }

        const datos = {
            "idioma": "pt",
            "agente": {
                "nombre": "Franco",
                "email": "contatofreest@gmail.com",
                "cadastur": "37.286.620/0001-49",
                "telefono": "21212312313"
            },
            "cliente": {
                "nombre": "Braian Axel Troncoso",
                "telefono": "12312313",
                "ciudad": "Cordoba",
                "destinoFinal": "Buzios",
                "cantidadPasajeros": "2"
            },
            "presupuesto": {
                "numero": "25",
                "fecha": "2025-11-24",
                "tipoViaje": "idaVuelta",
                "tipoTarifa": "light"
            },
            "vuelos": [
                {
                    "tipo": "ida",
                    "numero": "LA8049",
                    "origen": "COR",
                    "destino": "BUZ",
                    "fecha": "2025-12-03",
                    "horaSalida": "11:00",
                    "horaLlegada": "14:35",
                    "aerolinea": "LATAM",
                    "duracion": "3h 35m",
                    "escalas": "Directo"
                },
                {
                    "tipo": "vuelta",
                    "numero": "LA3325",
                    "origen": "BUZ",
                    "destino": "COR",
                    "fecha": "2025-12-10",
                    "horaSalida": "16:00",
                    "horaLlegada": "21:30",
                    "aerolinea": "LATAM",
                    "duracion": "5h 30m",
                    "escalas": "1 escala GRU"
                }
            ],
            "hoteles": [
                {
                    "nombre": "Hotel Buzios Beach",
                    "url": "https://www.booking.com/hotel/br/buzios-beach.html",
                    "tipoCuarto": "doble",
                    "fechaEntrada": "2025-12-03",
                    "fechaSalida": "2025-12-07",
                    "noches": "4",
                    "regimen": "mediaPension",
                    "imagen": imagenBase64
                },
                {
                    "nombre": "Pousada do Sol",
                    "url": "https://www.booking.com/hotel/br/pousada-sol.html",
                    "tipoCuarto": "suite",
                    "fechaEntrada": "2025-12-07",
                    "fechaSalida": "2025-12-10",
                    "noches": "3",
                    "regimen": "desayuno",
                    "imagen": imagenBase64
                }
            ],
            "incluyeTransfer": true,
            "incluyeSeguro": true,
            "incluyeVehiculo": false,
            "moneda": "USD",
            "valores": {
                "porPersona": "850",
                "total": "1700.00"
            }
        };

        console.log('=== TEST PDF 4 - Solo Ida + URL + Media Pensión + Imagen ===');

        const nombreArchivo = `test_presupuesto_4.pdf`;
        const outputPath = path.join(__dirname, 'temp', nombreArchivo);

        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        await generarPDF(datos, outputPath);

        res.download(outputPath, nombreArchivo, (err) => {
            if (err) {
                console.error('Error enviando PDF:', err);
            }
        });

    } catch (error) {
        console.error('Error generando PDF test 4:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para generar PDF
app.post('/api/generar-pdf', async (req, res) => {
    try {
        const datos = req.body;
        console.log('Generando PDF para:', datos.cliente?.nombre || 'cliente');

        // Nombre del archivo
        const nombreArchivo = `presupuesto_${datos.presupuesto?.numero || 'sin-numero'}_${(datos.cliente?.nombre || 'cliente').replace(/\s+/g, '_')}.pdf`;
        const outputPath = path.join(__dirname, 'temp', nombreArchivo);

        // Crear directorio temp si no existe
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Generar PDF
        await generarPDF(datos, outputPath);

        // Enviar archivo
        res.download(outputPath, nombreArchivo, (err) => {
            if (err) {
                console.error('Error enviando PDF:', err);
            }
            // Eliminar archivo temporal después de enviar
            setTimeout(() => {
                fs.unlink(outputPath, () => {});
            }, 5000);
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Servidor Freest Travel iniciado                       ║
║                                                            ║
║   📍 URL: http://localhost:${PORT}                          ║
║   📄 Abre index.html en el navegador                       ║
║                                                            ║
║   El PDF se generará con Puppeteer (CSS exacto)            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});
