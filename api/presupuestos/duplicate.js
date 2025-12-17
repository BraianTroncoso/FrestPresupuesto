// POST /api/presupuestos/duplicate - Duplicar presupuesto
import { withAuth } from '../../lib/auth.js';
import { duplicarPresupuesto } from '../../lib/db.js';

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

        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID del presupuesto es requerido' });
        }

        const resultado = await duplicarPresupuesto(
            parseInt(id),
            auth.usuario.id,
            auth.usuario.rol
        );

        return res.status(201).json({
            success: true,
            id: resultado.id,
            numero: resultado.numero
        });

    } catch (error) {
        console.error('Error al duplicar presupuesto:', error);

        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
