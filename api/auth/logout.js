// POST /api/auth/logout
import { logout, getTokenFromRequest } from '../../lib/auth.js';

export default async function handler(req, res) {
    // Solo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const token = getTokenFromRequest(req);

        if (token) {
            await logout(token);
        }

        // Limpiar cookie
        res.setHeader('Set-Cookie', [
            'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
        ]);

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error en logout:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
