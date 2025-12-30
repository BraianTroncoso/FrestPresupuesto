// POST /api/auth/login
import { login } from '../../lib/auth.js';

export default async function handler(req, res) {
    // Solo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const resultado = await login(email, password);

        if (!resultado.success) {
            return res.status(401).json({ error: resultado.error });
        }

        // Setear cookie httpOnly
        const maxAge = 7 * 24 * 60 * 60; // 7 días en segundos
        const secure = process.env.NODE_ENV === 'production';

        res.setHeader('Set-Cookie', [
            `auth_token=${resultado.token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure ? '; Secure' : ''}`
        ]);

        return res.status(200).json({
            success: true,
            usuario: resultado.usuario
        });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            detail: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
}
