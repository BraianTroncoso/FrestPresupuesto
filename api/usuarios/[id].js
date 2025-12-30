// GET/PUT/DELETE /api/usuarios/[id] - Gestión de usuarios (solo admin)
import { withAuth, actualizarUsuario, eliminarUsuario } from '../../lib/auth.js';
import { obtenerUsuarioPorId } from '../../lib/db.js';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID requerido' });
    }

    try {
        const auth = await withAuth(req, 'admin');

        if (!auth.authenticated) {
            return res.status(auth.error === 'Sin permisos suficientes' ? 403 : 401)
                .json({ error: auth.error });
        }

        // GET - Obtener un usuario
        if (req.method === 'GET') {
            const usuario = await obtenerUsuarioPorId(parseInt(id));

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            return res.status(200).json({
                success: true,
                data: usuario
            });
        }

        // PUT - Actualizar usuario
        if (req.method === 'PUT') {
            const datos = req.body;

            await actualizarUsuario(
                parseInt(id),
                datos,
                auth.usuario.rol
            );

            return res.status(200).json({
                success: true,
                id: parseInt(id)
            });
        }

        // DELETE - Desactivar usuario
        if (req.method === 'DELETE') {
            // No permitir eliminarse a sí mismo
            if (parseInt(id) === auth.usuario.id) {
                return res.status(400).json({
                    error: 'No puedes desactivar tu propia cuenta'
                });
            }

            await eliminarUsuario(parseInt(id), auth.usuario.rol);

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (error) {
        console.error('Error en usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
