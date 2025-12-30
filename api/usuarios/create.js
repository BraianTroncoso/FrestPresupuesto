// POST /api/usuarios/create - Crear usuario (solo admin)
import { withAuth, crearUsuario } from '../../lib/auth.js';

export default async function handler(req, res) {
    // Solo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const auth = await withAuth(req, 'admin');

        if (!auth.authenticated) {
            return res.status(auth.error === 'Sin permisos suficientes' ? 403 : 401)
                .json({ error: auth.error });
        }

        const { email, password, nombre, rol, telefono, cadastur } = req.body;

        // Validaciones
        if (!email || !password || !nombre) {
            return res.status(400).json({
                error: 'Email, contraseña y nombre son requeridos'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        if (rol && !['admin', 'agente'].includes(rol)) {
            return res.status(400).json({
                error: 'Rol inválido. Debe ser "admin" o "agente"'
            });
        }

        const resultado = await crearUsuario({
            email,
            password,
            nombre,
            rol: rol || 'agente',
            telefono,
            cadastur
        }, auth.usuario.rol);

        return res.status(201).json({
            success: true,
            id: resultado.id
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);

        if (error.message.includes('ya está registrado')) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
