// GET /api/auth/me
import { withAuth } from '../../lib/auth.js';

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

        return res.status(200).json(auth.usuario);

    } catch (error) {
        console.error('Error en me:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
