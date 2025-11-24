// Firebase Database Service
let db = null;

// Inicializar Firebase
function initFirebase() {
    if (!firebase.apps.length) {
        firebase.initializeApp(CONFIG.FIREBASE);
    }
    db = firebase.firestore();
    console.log('Firebase inicializado correctamente');
}

// ==================== PRESUPUESTOS ====================

// Guardar nuevo presupuesto
async function guardarPresupuesto(datos) {
    try {
        const presupuestoData = {
            ...datos,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            estado: 'activo'
        };

        const docRef = await db.collection('presupuestos').add(presupuestoData);
        console.log('Presupuesto guardado con ID:', docRef.id);

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error guardando presupuesto:', error);
        return { success: false, error: error.message };
    }
}

// Actualizar presupuesto existente
async function actualizarPresupuesto(id, datos) {
    try {
        const presupuestoData = {
            ...datos,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('presupuestos').doc(id).update(presupuestoData);
        console.log('Presupuesto actualizado:', id);

        return { success: true, id };
    } catch (error) {
        console.error('Error actualizando presupuesto:', error);
        return { success: false, error: error.message };
    }
}

// Obtener todos los presupuestos
async function obtenerPresupuestos(filtros = {}) {
    try {
        let query = db.collection('presupuestos').orderBy('createdAt', 'desc');

        // Aplicar filtros opcionales
        if (filtros.estado) {
            query = query.where('estado', '==', filtros.estado);
        }
        if (filtros.clienteNombre) {
            query = query.where('cliente.nombre', '==', filtros.clienteNombre);
        }
        if (filtros.limite) {
            query = query.limit(filtros.limite);
        }

        const snapshot = await query.get();
        const presupuestos = [];

        snapshot.forEach(doc => {
            presupuestos.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, data: presupuestos };
    } catch (error) {
        console.error('Error obteniendo presupuestos:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Obtener presupuesto por ID
async function obtenerPresupuestoPorId(id) {
    try {
        const doc = await db.collection('presupuestos').doc(id).get();

        if (!doc.exists) {
            return { success: false, error: 'Presupuesto no encontrado' };
        }

        return {
            success: true,
            data: { id: doc.id, ...doc.data() }
        };
    } catch (error) {
        console.error('Error obteniendo presupuesto:', error);
        return { success: false, error: error.message };
    }
}

// Eliminar presupuesto (soft delete)
async function eliminarPresupuesto(id) {
    try {
        await db.collection('presupuestos').doc(id).update({
            estado: 'eliminado',
            deletedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error eliminando presupuesto:', error);
        return { success: false, error: error.message };
    }
}

// Buscar presupuestos por cliente
async function buscarPorCliente(nombreCliente) {
    try {
        const snapshot = await db.collection('presupuestos')
            .where('estado', '==', 'activo')
            .orderBy('createdAt', 'desc')
            .get();

        const presupuestos = [];
        const searchTerm = nombreCliente.toLowerCase();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.cliente?.nombre?.toLowerCase().includes(searchTerm)) {
                presupuestos.push({ id: doc.id, ...data });
            }
        });

        return { success: true, data: presupuestos };
    } catch (error) {
        console.error('Error buscando presupuestos:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Obtener siguiente número de presupuesto
async function obtenerSiguienteNumeroPresupuesto() {
    try {
        const snapshot = await db.collection('presupuestos')
            .orderBy('presupuesto.numero', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return '01';
        }

        const ultimoPresupuesto = snapshot.docs[0].data();
        const ultimoNumero = parseInt(ultimoPresupuesto.presupuesto?.numero) || 0;
        return String(ultimoNumero + 1).padStart(2, '0');
    } catch (error) {
        console.error('Error obteniendo número:', error);
        // Fallback a localStorage
        const ultimoNumero = localStorage.getItem('freest_ultimo_presupuesto') || 0;
        return String(parseInt(ultimoNumero) + 1).padStart(2, '0');
    }
}

// Duplicar presupuesto
async function duplicarPresupuesto(id) {
    try {
        const resultado = await obtenerPresupuestoPorId(id);
        if (!resultado.success) {
            return resultado;
        }

        const presupuestoOriginal = resultado.data;
        delete presupuestoOriginal.id;
        delete presupuestoOriginal.createdAt;
        delete presupuestoOriginal.updatedAt;

        // Nuevo número de presupuesto
        const nuevoNumero = await obtenerSiguienteNumeroPresupuesto();
        presupuestoOriginal.presupuesto.numero = nuevoNumero;
        presupuestoOriginal.presupuesto.fecha = new Date().toISOString().split('T')[0];

        return await guardarPresupuesto(presupuestoOriginal);
    } catch (error) {
        console.error('Error duplicando presupuesto:', error);
        return { success: false, error: error.message };
    }
}
