// GET /api/presupuestos - Listar presupuestos
import { withAuth } from '../../lib/auth.js';
import { obtenerPresupuestos, obtenerSiguienteNumero } from '../../lib/db.js';

export default async function handler(req, res) {
    // Solo GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const auth = await withAuth(req);

        if (!auth.authenticated) {
            return res.status(401).json({ error: auth.error });
        }

        const { cliente, limite } = req.query;

        const filtros = {};
        if (cliente) filtros.clienteNombre = cliente;
        if (limite) filtros.limite = parseInt(limite);

        const presupuestos = await obtenerPresupuestos(
            auth.usuario.id,
            auth.usuario.rol,
            filtros
        );

        return res.status(200).json({
            success: true,
            data: presupuestos
        });

    } catch (error) {
        console.error('Error al obtener presupuestos:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
