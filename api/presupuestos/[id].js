// GET/PUT/DELETE /api/presupuestos/[id]
import { withAuth } from '../../lib/auth.js';
import { obtenerPresupuestoPorId, actualizarPresupuesto, eliminarPresupuesto } from '../../lib/db.js';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID requerido' });
    }

    try {
        const auth = await withAuth(req);

        if (!auth.authenticated) {
            return res.status(401).json({ error: auth.error });
        }

        const { usuario } = auth;

        // GET - Obtener un presupuesto
        if (req.method === 'GET') {
            const presupuesto = await obtenerPresupuestoPorId(
                parseInt(id),
                usuario.id,
                usuario.rol
            );

            if (!presupuesto) {
                return res.status(404).json({ error: 'Presupuesto no encontrado' });
            }

            return res.status(200).json({
                success: true,
                data: presupuesto
            });
        }

        // PUT - Actualizar presupuesto
        if (req.method === 'PUT') {
            const datos = req.body;

            await actualizarPresupuesto(
                parseInt(id),
                datos,
                usuario.id,
                usuario.rol
            );

            return res.status(200).json({
                success: true,
                id: parseInt(id)
            });
        }

        // DELETE - Eliminar presupuesto (soft delete)
        if (req.method === 'DELETE') {
            await eliminarPresupuesto(
                parseInt(id),
                usuario.id,
                usuario.rol
            );

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (error) {
        console.error('Error en presupuesto:', error);

        if (error.message.includes('Sin permisos')) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
