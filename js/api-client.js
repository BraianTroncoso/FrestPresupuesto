// Cliente API - Reemplaza firebase-db.js
// Llamadas a la API REST en lugar de Firebase

const API_BASE = '/api';

// ==================== HELPERS ====================

async function fetchAPI(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include' // Incluir cookies de sesión
    });

    // Sesión expirada
    if (response.status === 401) {
        localStorage.removeItem('usuario');
        window.location.href = '/login.html';
        throw new Error('Sesión expirada');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Error en la solicitud');
    }

    return data;
}

// ==================== AUTENTICACIÓN ====================

async function verificarSesion() {
    try {
        const usuario = await fetchAPI('/auth/me');
        return usuario;
    } catch (error) {
        return null;
    }
}

async function cerrarSesion() {
    try {
        await fetchAPI('/auth/logout', { method: 'POST' });
    } catch (e) {
        // Ignorar errores
    }
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
}

// ==================== PRESUPUESTOS ====================

async function guardarPresupuesto(datos) {
    try {
        const result = await fetchAPI('/presupuestos/create', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
        return { success: true, id: result.id, numero: result.numero };
    } catch (error) {
        console.error('Error guardando presupuesto:', error);
        return { success: false, error: error.message };
    }
}

async function actualizarPresupuesto(id, datos) {
    try {
        await fetchAPI(`/presupuestos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(datos)
        });
        return { success: true, id };
    } catch (error) {
        console.error('Error actualizando presupuesto:', error);
        return { success: false, error: error.message };
    }
}

async function obtenerPresupuestos(filtros = {}) {
    try {
        const params = new URLSearchParams();
        if (filtros.clienteNombre) params.append('cliente', filtros.clienteNombre);
        if (filtros.limite) params.append('limite', filtros.limite);

        const queryString = params.toString();
        const result = await fetchAPI(`/presupuestos${queryString ? '?' + queryString : ''}`);
        return { success: true, data: result.data || [] };
    } catch (error) {
        console.error('Error obteniendo presupuestos:', error);
        return { success: false, error: error.message, data: [] };
    }
}

async function obtenerPresupuestoPorId(id) {
    try {
        const result = await fetchAPI(`/presupuestos/${id}`);
        return { success: true, data: result.data };
    } catch (error) {
        console.error('Error obteniendo presupuesto:', error);
        return { success: false, error: error.message };
    }
}

async function eliminarPresupuesto(id) {
    try {
        await fetchAPI(`/presupuestos/${id}`, { method: 'DELETE' });
        return { success: true };
    } catch (error) {
        console.error('Error eliminando presupuesto:', error);
        return { success: false, error: error.message };
    }
}

async function duplicarPresupuesto(id) {
    try {
        const result = await fetchAPI('/presupuestos/duplicate', {
            method: 'POST',
            body: JSON.stringify({ id })
        });
        return { success: true, id: result.id, numero: result.numero };
    } catch (error) {
        console.error('Error duplicando presupuesto:', error);
        return { success: false, error: error.message };
    }
}

async function obtenerSiguienteNumeroPresupuesto() {
    try {
        const result = await fetchAPI('/presupuestos/next-number');
        return result.numero;
    } catch (error) {
        console.error('Error obteniendo número:', error);
        // Fallback a localStorage
        const ultimoNumero = localStorage.getItem('freest_ultimo_presupuesto') || '0';
        return String(parseInt(ultimoNumero) + 1).padStart(2, '0');
    }
}

async function buscarPorCliente(nombreCliente) {
    return obtenerPresupuestos({ clienteNombre: nombreCliente });
}

// ==================== USUARIOS (solo admin) ====================

async function obtenerUsuarios() {
    try {
        const result = await fetchAPI('/usuarios');
        return { success: true, data: result.data || [] };
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        return { success: false, error: error.message, data: [] };
    }
}

async function crearUsuario(datos) {
    try {
        const result = await fetchAPI('/usuarios/create', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
        return { success: true, id: result.id };
    } catch (error) {
        console.error('Error creando usuario:', error);
        return { success: false, error: error.message };
    }
}

async function actualizarUsuario(id, datos) {
    try {
        await fetchAPI(`/usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(datos)
        });
        return { success: true, id };
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        return { success: false, error: error.message };
    }
}

async function eliminarUsuario(id) {
    try {
        await fetchAPI(`/usuarios/${id}`, { method: 'DELETE' });
        return { success: true };
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        return { success: false, error: error.message };
    }
}

// ==================== COMPATIBILIDAD ====================

// Función vacía para compatibilidad con código existente
function initFirebase() {
    console.log('API Client inicializado (Firebase no se usa)');
}

// Obtener usuario actual desde localStorage
function getUsuarioActual() {
    try {
        return JSON.parse(localStorage.getItem('usuario'));
    } catch {
        return null;
    }
}

// Verificar si es admin
function esAdmin() {
    const usuario = getUsuarioActual();
    return usuario?.rol === 'admin';
}

// ==================== VENTAS (marcar vendido) ====================

async function marcarVendido(id, vendido = true) {
    try {
        const result = await fetchAPI(`/presupuestos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ vendido })
        });
        return { success: true, id: result.id, vendido: result.vendido };
    } catch (error) {
        console.error('Error marcando vendido:', error);
        return { success: false, error: error.message };
    }
}

// ==================== ESTADÍSTICAS (solo admin) ====================

async function obtenerEstadisticasVentas(periodo = 'todos') {
    try {
        const result = await fetchAPI(`/estadisticas/ventas?periodo=${periodo}`);
        return {
            success: true,
            data: result.data || [],
            totales: result.totales || {},
            periodo: result.periodo
        };
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return { success: false, error: error.message, data: [], totales: {} };
    }
}
