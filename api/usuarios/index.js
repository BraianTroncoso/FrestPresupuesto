// GET /api/usuarios - Listar usuarios (solo admin)
import { withAuth } from '../../lib/auth.js';
import { obtenerUsuarios } from '../../lib/db.js';

export default async function handler(req, res) {
    // Solo GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const auth = await withAuth(req, 'admin');

        if (!auth.authenticated) {
            return res.status(auth.error === 'Sin permisos suficientes' ? 403 : 401)
                .json({ error: auth.error });
        }

        const usuarios = await obtenerUsuarios();

        return res.status(200).json({
            success: true,
            data: usuarios
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
