// GET /api/estadisticas/ventas - Estadísticas de ventas por agente (solo admin)
import { withAuth } from '../../lib/auth.js';
import { getDB } from '../../lib/db.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const auth = await withAuth(req, 'admin');

        if (!auth.authenticated) {
            return res.status(auth.error === 'Sin permisos suficientes' ? 403 : 401)
                .json({ error: auth.error });
        }

        const db = getDB();

        // Obtener parámetro de período
        const { periodo = 'todos' } = req.query;

        // Calcular fecha de filtro según período
        let fechaFiltro = null;
        const now = new Date();

        switch (periodo) {
            case 'hoy':
                fechaFiltro = now.toISOString().split('T')[0];
                break;
            case '7dias':
                const hace7dias = new Date(now);
                hace7dias.setDate(hace7dias.getDate() - 7);
                fechaFiltro = hace7dias.toISOString().split('T')[0];
                break;
            case 'mes':
                fechaFiltro = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                break;
            case 'anio':
                fechaFiltro = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
                break;
            default:
                fechaFiltro = null;
        }

        // Query para estadísticas por agente
        const whereClause = fechaFiltro
            ? `AND (p.fecha_venta >= '${fechaFiltro}' OR (p.vendido = 0 AND p.created_at >= '${fechaFiltro}'))`
            : '';

        const statsQuery = `
            SELECT
                u.id as agente_id,
                u.nombre as agente_nombre,
                u.email as agente_email,
                u.rol as agente_rol,
                COUNT(p.id) as total_presupuestos,
                COALESCE(SUM(CASE WHEN p.vendido = 1 THEN 1 ELSE 0 END), 0) as total_vendidos,
                COALESCE(SUM(CASE WHEN p.vendido = 1 AND p.moneda = 'USD' THEN p.valor_total ELSE 0 END), 0) as vendido_usd,
                COALESCE(SUM(CASE WHEN p.vendido = 1 AND p.moneda = 'BRL' THEN p.valor_total ELSE 0 END), 0) as vendido_brl
            FROM usuarios u
            LEFT JOIN presupuestos p ON u.id = p.agente_id
                AND p.estado = 'activo'
                ${whereClause}
            WHERE u.activo = 1
            GROUP BY u.id, u.nombre, u.email, u.rol
            ORDER BY total_vendidos DESC, total_presupuestos DESC
        `;

        const statsResult = await db.execute(statsQuery);

        // Obtener presupuestos vendidos de cada agente para el detalle
        const agentesConDetalle = await Promise.all(
            statsResult.rows.map(async (agente) => {
                const presupuestosQuery = `
                    SELECT
                        id,
                        numero,
                        fecha,
                        cliente_nombre,
                        cliente_telefono,
                        cliente_ciudad,
                        destino_final,
                        cantidad_pasajeros,
                        valor_total,
                        moneda,
                        fecha_venta,
                        vendido
                    FROM presupuestos
                    WHERE agente_id = ?
                        AND estado = 'activo'
                        AND vendido = 1
                        ${fechaFiltro ? `AND fecha_venta >= '${fechaFiltro}'` : ''}
                    ORDER BY fecha_venta DESC
                    LIMIT 50
                `;

                const presupuestosResult = await db.execute({
                    sql: presupuestosQuery,
                    args: [agente.agente_id]
                });

                return {
                    ...agente,
                    presupuestos: presupuestosResult.rows
                };
            })
        );

        // Calcular totales
        const totales = agentesConDetalle.reduce((acc, agente) => ({
            presupuestos: acc.presupuestos + (agente.total_presupuestos || 0),
            vendidos: acc.vendidos + (agente.total_vendidos || 0),
            vendido_usd: acc.vendido_usd + (agente.vendido_usd || 0),
            vendido_brl: acc.vendido_brl + (agente.vendido_brl || 0)
        }), { presupuestos: 0, vendidos: 0, vendido_usd: 0, vendido_brl: 0 });

        return res.status(200).json({
            success: true,
            periodo,
            data: agentesConDetalle,
            totales
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            detail: error.message
        });
    }
}
