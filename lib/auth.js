// Sistema de autenticación
import { getDB } from './db.js';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

// Duración de sesión: 7 días
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function login(email, password) {
    const db = getDB();

    // Buscar usuario
    const result = await db.execute('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email.toLowerCase().trim()]);

    if (result.rows.length === 0) {
        return { success: false, error: 'Credenciales incorrectas' };
    }

    const usuario = result.rows[0];

    // Verificar password
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
        return { success: false, error: 'Credenciales incorrectas' };
    }

    // Crear sesión
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

    await db.execute('INSERT INTO sesiones (usuario_id, token, expires_at) VALUES (?, ?, ?)', [usuario.id, token, expiresAt]);

    return {
        success: true,
        token,
        usuario: {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
            telefono: usuario.telefono,
            cadastur: usuario.cadastur
        }
    };
}

export async function verificarSesion(token) {
    if (!token) return null;

    const db = getDB();

    const result = await db.execute(
        `SELECT u.id, u.email, u.nombre, u.rol, u.telefono, u.cadastur
         FROM sesiones s
         JOIN usuarios u ON s.usuario_id = u.id
         WHERE s.token = ? AND s.expires_at > datetime('now') AND u.activo = 1`,
        [token]
    );

    if (result.rows.length === 0) return null;

    const usuario = result.rows[0];
    return {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        telefono: usuario.telefono,
        cadastur: usuario.cadastur
    };
}

export async function logout(token) {
    if (!token) return;

    const db = getDB();
    await db.execute('DELETE FROM sesiones WHERE token = ?', [token]);
}

export async function crearUsuario(datos, creadorRol) {
    // Solo admin puede crear usuarios
    if (creadorRol !== 'admin') {
        throw new Error('Sin permisos para crear usuarios');
    }

    const db = getDB();

    // Verificar si el email ya existe
    const existing = await db.execute('SELECT id FROM usuarios WHERE email = ?', [datos.email.toLowerCase().trim()]);

    if (existing.rows.length > 0) {
        throw new Error('El email ya está registrado');
    }

    // Hash del password
    const passwordHash = await bcrypt.hash(datos.password, 10);

    // Insertar usuario
    const result = await db.execute(
        'INSERT INTO usuarios (email, password_hash, nombre, rol, telefono, cadastur) VALUES (?, ?, ?, ?, ?, ?)',
        [datos.email.toLowerCase().trim(), passwordHash, datos.nombre, datos.rol || 'agente', datos.telefono || '', datos.cadastur || '']
    );

    return { id: Number(result.lastInsertRowid) };
}

export async function actualizarUsuario(id, datos, editorRol) {
    // Solo admin puede editar usuarios
    if (editorRol !== 'admin') {
        throw new Error('Sin permisos para editar usuarios');
    }

    const db = getDB();

    // Construir query dinámicamente
    const updates = [];
    const args = [];

    if (datos.nombre !== undefined) {
        updates.push('nombre = ?');
        args.push(datos.nombre);
    }
    if (datos.telefono !== undefined) {
        updates.push('telefono = ?');
        args.push(datos.telefono);
    }
    if (datos.cadastur !== undefined) {
        updates.push('cadastur = ?');
        args.push(datos.cadastur);
    }
    if (datos.rol !== undefined) {
        updates.push('rol = ?');
        args.push(datos.rol);
    }
    if (datos.activo !== undefined) {
        updates.push('activo = ?');
        args.push(datos.activo ? 1 : 0);
    }
    if (datos.password) {
        const passwordHash = await bcrypt.hash(datos.password, 10);
        updates.push('password_hash = ?');
        args.push(passwordHash);
    }

    if (updates.length === 0) {
        return { id };
    }

    updates.push("updated_at = datetime('now')");
    args.push(id);

    await db.execute(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`, args);

    return { id };
}

export async function eliminarUsuario(id, editorRol) {
    // Solo admin puede eliminar usuarios
    if (editorRol !== 'admin') {
        throw new Error('Sin permisos para eliminar usuarios');
    }

    const db = getDB();

    // Desactivar en lugar de eliminar
    await db.execute('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);

    // Eliminar sesiones del usuario
    await db.execute('DELETE FROM sesiones WHERE usuario_id = ?', [id]);

    return { success: true };
}

// Obtener token de la cookie
export function getTokenFromRequest(req) {
    // Primero intentar desde cookie
    const cookies = req.headers.cookie || '';
    const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('auth_token='));
    if (tokenCookie) {
        return tokenCookie.split('=')[1];
    }

    // Luego desde header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
}

// Middleware para proteger rutas
export async function withAuth(req, requiredRole = null) {
    const token = getTokenFromRequest(req);
    const usuario = await verificarSesion(token);

    if (!usuario) {
        return { authenticated: false, error: 'No autenticado' };
    }

    if (requiredRole && usuario.rol !== requiredRole && usuario.rol !== 'admin') {
        return { authenticated: false, error: 'Sin permisos suficientes' };
    }

    return { authenticated: true, usuario };
}
