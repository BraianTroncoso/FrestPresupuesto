// Generador PDF - Llama al backend con Puppeteer
// Descarga directa del PDF generado en el servidor

async function exportarPDF() {
    console.log('=== EXPORTANDO PDF ===');

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

        // Llamar al endpoint del backend
        const response = await fetch('/api/generar-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al generar PDF');
        }

        // Descargar el PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `presupuesto_${datos.presupuesto?.numero || 'sin-numero'}_${datos.cliente?.nombre || 'cliente'}.pdf`.replace(/\s+/g, '_');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        if (typeof showToast === 'function') {
            showToast('PDF exportado correctamente', 'success');
        }

        console.log('=== PDF DESCARGADO ===');

    } catch (error) {
        console.error('Error generando PDF:', error);
        if (typeof mostrarErrorAmigable === 'function') {
            mostrarErrorAmigable(error.message);
        } else if (typeof showToast === 'function') {
            showToast('Error al generar PDF: ' + error.message, 'error');
        }
    }
}
