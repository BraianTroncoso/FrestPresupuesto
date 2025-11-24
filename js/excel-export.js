// Módulo de exportación a Excel

function exportarExcel() {
    const datos = recolectarDatos();

    // Crear fila con todos los datos aplanados
    const fila = {
        // Presupuesto
        'Número Presupuesto': datos.presupuesto.numero,
        'Fecha Presupuesto': datos.presupuesto.fecha,
        'Tipo Viaje': datos.presupuesto.tipoViaje,

        // Agente
        'Nombre Agente': datos.agente.nombre,
        'Email Agente': datos.agente.email,
        'Cadastur': datos.agente.cadastur,
        'Teléfono Agente': datos.agente.telefono,

        // Cliente
        'Nombre Cliente': datos.cliente.nombre,
        'Teléfono Cliente': datos.cliente.telefono,
        'Ciudad Cliente': datos.cliente.ciudad,
        'Cantidad Pasajeros': datos.cliente.cantidadPasajeros,

        // Valores
        'Valor por Persona': datos.valores.porPersona,
        'Valor Total': datos.valores.total
    };

    // Agregar vuelos (hasta 5 vuelos soportados)
    for (let i = 0; i < 5; i++) {
        const vuelo = datos.vuelos[i] || {};
        const prefix = `Vuelo ${i + 1}`;
        fila[`${prefix} - Número`] = vuelo.numero || '';
        fila[`${prefix} - Origen`] = vuelo.origen || '';
        fila[`${prefix} - Destino`] = vuelo.destino || '';
        fila[`${prefix} - Fecha`] = vuelo.fecha || '';
        fila[`${prefix} - Hora Salida`] = vuelo.horaSalida || '';
        fila[`${prefix} - Hora Llegada`] = vuelo.horaLlegada || '';
        fila[`${prefix} - Aerolínea`] = vuelo.aerolinea || '';
        fila[`${prefix} - Duración`] = vuelo.duracion || '';
        fila[`${prefix} - Escalas`] = vuelo.escalas || '';
    }

    // Agregar hoteles (hasta 5 hoteles soportados)
    for (let i = 0; i < 5; i++) {
        const hotel = datos.hoteles[i] || {};
        const prefix = `Hotel ${i + 1}`;
        fila[`${prefix} - Nombre`] = hotel.nombre || '';
        fila[`${prefix} - URL`] = hotel.url || '';
        fila[`${prefix} - Tipo Cuarto`] = hotel.tipoCuarto || '';
        fila[`${prefix} - Fecha Entrada`] = hotel.fechaEntrada || '';
        fila[`${prefix} - Fecha Salida`] = hotel.fechaSalida || '';
        fila[`${prefix} - Noches`] = hotel.noches || '';
        fila[`${prefix} - Régimen`] = hotel.regimen || '';
        fila[`${prefix} - Valor/Noche`] = hotel.valorNoche || '';
        fila[`${prefix} - Valor Total`] = hotel.valorTotal || '';
    }

    // Agregar transfers (hasta 5 soportados)
    for (let i = 0; i < 5; i++) {
        const transfer = datos.transfers[i] || {};
        const prefix = `Transfer ${i + 1}`;
        fila[`${prefix} - Tipo`] = transfer.tipo || '';
        fila[`${prefix} - Origen`] = transfer.origen || '';
        fila[`${prefix} - Destino`] = transfer.destino || '';
        fila[`${prefix} - Fecha`] = transfer.fecha || '';
        fila[`${prefix} - Valor`] = transfer.valor || '';
    }

    // Seguro
    fila['Seguro - Nombre'] = datos.seguro.nombre;
    fila['Seguro - Cobertura'] = datos.seguro.cobertura;
    fila['Seguro - Valor'] = datos.seguro.valor;

    // Vehículo
    fila['Vehículo - Tipo'] = datos.vehiculo.tipo;
    fila['Vehículo - Empresa'] = datos.vehiculo.empresa;
    fila['Vehículo - Fecha Inicio'] = datos.vehiculo.fechaInicio;
    fila['Vehículo - Fecha Fin'] = datos.vehiculo.fechaFin;
    fila['Vehículo - Valor'] = datos.vehiculo.valor;

    // Crear worksheet y workbook
    const ws = XLSX.utils.json_to_sheet([fila]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Presupuesto');

    // Ajustar anchos de columna
    const colWidths = Object.keys(fila).map(key => ({
        wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;

    // Guardar archivo
    const nombreArchivo = `presupuesto_${datos.presupuesto.numero || 'sin-numero'}_${datos.cliente.nombre || 'cliente'}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo.replace(/\s+/g, '_'));
    showToast('Excel exportado correctamente');
}

// Función para exportar múltiples presupuestos (historial)
function exportarHistorialExcel(presupuestos) {
    if (!presupuestos || presupuestos.length === 0) {
        showToast('No hay presupuestos para exportar', 'error');
        return;
    }

    const filas = presupuestos.map(datos => ({
        'Número Presupuesto': datos.presupuesto.numero,
        'Fecha Presupuesto': datos.presupuesto.fecha,
        'Nombre Cliente': datos.cliente.nombre,
        'Ciudad Cliente': datos.cliente.ciudad,
        'Pasajeros': datos.cliente.cantidadPasajeros,
        'Tipo Viaje': datos.presupuesto.tipoViaje,
        'Valor por Persona': datos.valores.porPersona,
        'Valor Total': datos.valores.total,
        'Nombre Agente': datos.agente.nombre
    }));

    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');

    XLSX.writeFile(wb, `historial_presupuestos_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Historial exportado correctamente');
}
