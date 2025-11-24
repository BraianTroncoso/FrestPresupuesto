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
app.use(express.json());
app.use(express.static(__dirname));

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
