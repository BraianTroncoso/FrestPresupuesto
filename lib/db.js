// Cliente Turso y funciones CRUD
import { createClient } from '@libsql/client';

let db = null;

export function getDB() {
    if (!db) {
        db = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN
        });
    }
    return db;
}

// ==================== PRESUPUESTOS ====================

export async function guardarPresupuesto(datos, agenteId) {
    const db = getDB();

    // Obtener siguiente número
    const configResult = await db.execute("SELECT valor FROM configuracion WHERE clave = 'ultimo_numero_presupuesto'");
    let ultimoNumero = parseInt(configResult.rows[0]?.valor || '0');
    const nuevoNumero = String(ultimoNumero + 1).padStart(2, '0');

    // Insertar presupuesto
    const presupuestoResult = await db.execute(
        `INSERT INTO presupuestos (
            numero, fecha, tipo_viaje, tipo_tarifa,
            agente_id, agente_nombre, agente_email, agente_telefono, agente_cadastur,
            cliente_nombre, cliente_telefono, cliente_ciudad, destino_final, cantidad_pasajeros,
            incluye_transfer, incluye_seguro, incluye_vehiculo,
            moneda, valor_por_persona, valor_total, idioma
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            nuevoNumero,
            datos.presupuesto?.fecha || new Date().toISOString().split('T')[0],
            datos.presupuesto?.tipoViaje || 'idaVuelta',
            datos.presupuesto?.tipoTarifa || null,
            agenteId,
            datos.agente?.nombre || '',
            datos.agente?.email || '',
            datos.agente?.telefono || '',
            datos.agente?.cadastur || '',
            datos.cliente?.nombre || '',
            datos.cliente?.telefono || '',
            datos.cliente?.ciudad || '',
            datos.cliente?.destinoFinal || '',
            datos.cliente?.cantidadPasajeros || 1,
            datos.incluyeTransfer ? 1 : 0,
            datos.incluyeSeguro ? 1 : 0,
            datos.incluyeVehiculo ? 1 : 0,
            datos.moneda || 'USD',
            parseFloat(datos.valores?.porPersona) || 0,
            parseFloat(datos.valores?.total) || 0,
            datos.idioma || 'es'
        ]
    );

    const presupuestoId = Number(presupuestoResult.lastInsertRowid);

    // Insertar vuelos
    if (datos.vuelos?.length > 0) {
        for (let i = 0; i < datos.vuelos.length; i++) {
            const v = datos.vuelos[i];
            if (v.numero || v.origen || v.destino) {
                await db.execute(
                    `INSERT INTO vuelos (presupuesto_id, orden, tipo, numero, origen, destino, fecha, hora_salida, hora_llegada, aerolinea, duracion, escalas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [presupuestoId, i, v.tipo || 'ida', v.numero || '', v.origen || '', v.destino || '', v.fecha || '', v.horaSalida || '', v.horaLlegada || '', v.aerolinea || '', v.duracion || '', v.escalas || 'Directo']
                );
            }
        }
    }

    // Insertar hoteles
    if (datos.hoteles?.length > 0) {
        for (let i = 0; i < datos.hoteles.length; i++) {
            const h = datos.hoteles[i];
            if (h.nombre) {
                await db.execute(
                    `INSERT INTO hoteles (presupuesto_id, orden, nombre, url, tipo_cuarto, fecha_entrada, fecha_salida, noches, regimen, imagen_base64) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [presupuestoId, i, h.nombre || '', h.url || '', h.tipoCuarto || '', h.fechaEntrada || '', h.fechaSalida || '', parseInt(h.noches) || 0, h.regimen || '', h.imagen || '']
                );
            }
        }
    }

    // Actualizar contador
    await db.execute(
        "UPDATE configuracion SET valor = ?, updated_at = datetime('now') WHERE clave = 'ultimo_numero_presupuesto'",
        [String(ultimoNumero + 1)]
    );

    return { id: presupuestoId, numero: nuevoNumero };
}

export async function actualizarPresupuesto(id, datos, agenteId, rol) {
    const db = getDB();

    // Verificar permisos
    const existing = await db.execute('SELECT agente_id FROM presupuestos WHERE id = ? AND estado = ?', [id, 'activo']);

    if (existing.rows.length === 0) {
        throw new Error('Presupuesto no encontrado');
    }

    if (rol !== 'admin' && existing.rows[0].agente_id !== agenteId) {
        throw new Error('Sin permisos para editar este presupuesto');
    }

    // Actualizar presupuesto
    await db.execute(
        `UPDATE presupuestos SET
            fecha = ?, tipo_viaje = ?, tipo_tarifa = ?,
            agente_nombre = ?, agente_email = ?, agente_telefono = ?, agente_cadastur = ?,
            cliente_nombre = ?, cliente_telefono = ?, cliente_ciudad = ?, destino_final = ?, cantidad_pasajeros = ?,
            incluye_transfer = ?, incluye_seguro = ?, incluye_vehiculo = ?,
            moneda = ?, valor_por_persona = ?, valor_total = ?, idioma = ?,
            updated_at = datetime('now')
        WHERE id = ?`,
        [
            datos.presupuesto?.fecha,
            datos.presupuesto?.tipoViaje,
            datos.presupuesto?.tipoTarifa,
            datos.agente?.nombre,
            datos.agente?.email,
            datos.agente?.telefono,
            datos.agente?.cadastur,
            datos.cliente?.nombre,
            datos.cliente?.telefono,
            datos.cliente?.ciudad,
            datos.cliente?.destinoFinal,
            datos.cliente?.cantidadPasajeros || 1,
            datos.incluyeTransfer ? 1 : 0,
            datos.incluyeSeguro ? 1 : 0,
            datos.incluyeVehiculo ? 1 : 0,
            datos.moneda || 'USD',
            parseFloat(datos.valores?.porPersona) || 0,
            parseFloat(datos.valores?.total) || 0,
            datos.idioma || 'es',
            id
        ]
    );

    // Eliminar vuelos y hoteles existentes
    await db.execute('DELETE FROM vuelos WHERE presupuesto_id = ?', [id]);
    await db.execute('DELETE FROM hoteles WHERE presupuesto_id = ?', [id]);

    // Reinsertar vuelos
    if (datos.vuelos?.length > 0) {
        for (let i = 0; i < datos.vuelos.length; i++) {
            const v = datos.vuelos[i];
            if (v.numero || v.origen || v.destino) {
                await db.execute(
                    `INSERT INTO vuelos (presupuesto_id, orden, tipo, numero, origen, destino, fecha, hora_salida, hora_llegada, aerolinea, duracion, escalas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, i, v.tipo || 'ida', v.numero || '', v.origen || '', v.destino || '', v.fecha || '', v.horaSalida || '', v.horaLlegada || '', v.aerolinea || '', v.duracion || '', v.escalas || 'Directo']
                );
            }
        }
    }

    // Reinsertar hoteles
    if (datos.hoteles?.length > 0) {
        for (let i = 0; i < datos.hoteles.length; i++) {
            const h = datos.hoteles[i];
            if (h.nombre) {
                await db.execute(
                    `INSERT INTO hoteles (presupuesto_id, orden, nombre, url, tipo_cuarto, fecha_entrada, fecha_salida, noches, regimen, imagen_base64) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, i, h.nombre || '', h.url || '', h.tipoCuarto || '', h.fechaEntrada || '', h.fechaSalida || '', parseInt(h.noches) || 0, h.regimen || '', h.imagen || '']
                );
            }
        }
    }

    return { id };
}

export async function obtenerPresupuestos(agenteId, rol, filtros = {}) {
    const db = getDB();

    let sql = `SELECT * FROM presupuestos WHERE estado = 'activo'`;
    const args = [];

    // Si no es admin, filtrar por agente
    if (rol !== 'admin') {
        sql += ' AND agente_id = ?';
        args.push(agenteId);
    }

    // Filtro por nombre de cliente
    if (filtros.clienteNombre) {
        sql += ' AND cliente_nombre LIKE ?';
        args.push(`%${filtros.clienteNombre}%`);
    }

    sql += ' ORDER BY created_at DESC';

    if (filtros.limite) {
        sql += ' LIMIT ?';
        args.push(parseInt(filtros.limite));
    }

    const result = await db.execute(sql, args);
    return result.rows;
}

export async function obtenerPresupuestoPorId(id, agenteId, rol) {
    const db = getDB();

    // Obtener presupuesto
    let sql = "SELECT * FROM presupuestos WHERE id = ? AND estado = 'activo'";
    const args = [id];

    if (rol !== 'admin') {
        sql += ' AND agente_id = ?';
        args.push(agenteId);
    }

    const presupuestoResult = await db.execute(sql, args);

    if (presupuestoResult.rows.length === 0) {
        return null;
    }

    const presupuesto = presupuestoResult.rows[0];

    // Obtener vuelos
    const vuelosResult = await db.execute('SELECT * FROM vuelos WHERE presupuesto_id = ? ORDER BY orden', [id]);

    // Obtener hoteles
    const hotelesResult = await db.execute('SELECT * FROM hoteles WHERE presupuesto_id = ? ORDER BY orden', [id]);

    // Transformar a formato compatible con el frontend
    return {
        id: presupuesto.id,
        agente: {
            nombre: presupuesto.agente_nombre,
            email: presupuesto.agente_email,
            telefono: presupuesto.agente_telefono,
            cadastur: presupuesto.agente_cadastur
        },
        cliente: {
            nombre: presupuesto.cliente_nombre,
            telefono: presupuesto.cliente_telefono,
            ciudad: presupuesto.cliente_ciudad,
            destinoFinal: presupuesto.destino_final,
            cantidadPasajeros: presupuesto.cantidad_pasajeros
        },
        presupuesto: {
            numero: presupuesto.numero,
            fecha: presupuesto.fecha,
            tipoViaje: presupuesto.tipo_viaje,
            tipoTarifa: presupuesto.tipo_tarifa
        },
        vuelos: vuelosResult.rows.map(v => ({
            tipo: v.tipo,
            numero: v.numero,
            origen: v.origen,
            destino: v.destino,
            fecha: v.fecha,
            horaSalida: v.hora_salida,
            horaLlegada: v.hora_llegada,
            aerolinea: v.aerolinea,
            duracion: v.duracion,
            escalas: v.escalas
        })),
        hoteles: hotelesResult.rows.map(h => ({
            nombre: h.nombre,
            url: h.url,
            tipoCuarto: h.tipo_cuarto,
            fechaEntrada: h.fecha_entrada,
            fechaSalida: h.fecha_salida,
            noches: h.noches,
            regimen: h.regimen,
            imagen: h.imagen_base64
        })),
        incluyeTransfer: Boolean(presupuesto.incluye_transfer),
        incluyeSeguro: Boolean(presupuesto.incluye_seguro),
        incluyeVehiculo: Boolean(presupuesto.incluye_vehiculo),
        moneda: presupuesto.moneda,
        valores: {
            porPersona: presupuesto.valor_por_persona,
            total: presupuesto.valor_total
        },
        idioma: presupuesto.idioma,
        createdAt: presupuesto.created_at,
        updatedAt: presupuesto.updated_at
    };
}

export async function eliminarPresupuesto(id, agenteId, rol) {
    const db = getDB();

    // Verificar permisos
    const existing = await db.execute('SELECT agente_id FROM presupuestos WHERE id = ? AND estado = ?', [id, 'activo']);

    if (existing.rows.length === 0) {
        throw new Error('Presupuesto no encontrado');
    }

    if (rol !== 'admin' && existing.rows[0].agente_id !== agenteId) {
        throw new Error('Sin permisos para eliminar este presupuesto');
    }

    // Soft delete
    await db.execute("UPDATE presupuestos SET estado = 'eliminado', deleted_at = datetime('now') WHERE id = ?", [id]);

    return { success: true };
}

export async function duplicarPresupuesto(id, agenteId, rol) {
    const db = getDB();

    // Obtener presupuesto original
    const original = await obtenerPresupuestoPorId(id, agenteId, rol);

    if (!original) {
        throw new Error('Presupuesto no encontrado');
    }

    // Crear nuevo con los mismos datos
    const nuevoPresupuesto = {
        ...original,
        presupuesto: {
            ...original.presupuesto,
            fecha: new Date().toISOString().split('T')[0]
        }
    };

    delete nuevoPresupuesto.id;
    delete nuevoPresupuesto.createdAt;
    delete nuevoPresupuesto.updatedAt;

    return await guardarPresupuesto(nuevoPresupuesto, agenteId);
}

export async function obtenerSiguienteNumero() {
    const db = getDB();

    const result = await db.execute("SELECT valor FROM configuracion WHERE clave = 'ultimo_numero_presupuesto'");

    const ultimoNumero = parseInt(result.rows[0]?.valor || '0');
    return String(ultimoNumero + 1).padStart(2, '0');
}

// ==================== USUARIOS ====================

export async function obtenerUsuarios() {
    const db = getDB();
    const result = await db.execute('SELECT id, email, nombre, rol, telefono, cadastur, activo, created_at FROM usuarios ORDER BY created_at DESC');
    return result.rows;
}

export async function obtenerUsuarioPorId(id) {
    const db = getDB();
    const result = await db.execute('SELECT id, email, nombre, rol, telefono, cadastur, activo, created_at FROM usuarios WHERE id = ?', [id]);
    return result.rows[0] || null;
}
