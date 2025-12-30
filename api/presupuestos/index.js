// GET /api/presupuestos - Listar presupuestos
// POST /api/presupuestos - Crear nuevo presupuesto
import { withAuth } from '../../lib/auth.js';
import { obtenerPresupuestos, guardarPresupuesto } from '../../lib/db.js';

export default async function handler(req, res) {
    try {
        const auth = await withAuth(req);

        if (!auth.authenticated) {
            return res.status(401).json({ error: auth.error });
        }

        // GET - Listar presupuestos
        if (req.method === 'GET') {
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
        }

        // POST - Crear presupuesto
        if (req.method === 'POST') {
            const datos = req.body;

            // Validaciones básicas
            if (!datos.cliente?.nombre) {
                return res.status(400).json({ error: 'Nombre del cliente es requerido' });
            }

            const resultado = await guardarPresupuesto(datos, auth.usuario.id);

            return res.status(201).json({
                success: true,
                id: resultado.id,
                numero: resultado.numero
            });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (error) {
        console.error('Error en presupuestos:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
