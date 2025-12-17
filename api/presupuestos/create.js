// POST /api/presupuestos/create - Crear nuevo presupuesto
import { withAuth } from '../../lib/auth.js';
import { guardarPresupuesto } from '../../lib/db.js';

export default async function handler(req, res) {
    // Solo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const auth = await withAuth(req);

        if (!auth.authenticated) {
            return res.status(401).json({ error: auth.error });
        }

        const datos = req.body;

        // Validaciones básicas
        if (!datos.cliente?.nombre) {
            return res.status(400).json({ error: 'Nombre del cliente es requerido' });
        }

        const resultado = await guardarPresupuesto(datos, auth.usuario.id);

        return res.status(201).json({
            success: true,
            id: resultado.id,
            numero: resultado.numero
        });

    } catch (error) {
        console.error('Error al crear presupuesto:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
