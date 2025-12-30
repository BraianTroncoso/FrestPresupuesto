// GET /api/presupuestos/next-number - Obtener siguiente número
import { withAuth } from '../../lib/auth.js';
import { obtenerSiguienteNumero } from '../../lib/db.js';

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

        const numero = await obtenerSiguienteNumero();

        return res.status(200).json({ numero });

    } catch (error) {
        console.error('Error al obtener número:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
