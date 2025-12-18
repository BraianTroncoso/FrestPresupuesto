// Script para crear las tablas en Turso
// Ejecutar: node scripts/setup-database.js

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

const schema = `
-- Tabla de usuarios (autenticación y roles)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('admin', 'agente')),
    telefono TEXT,
    cadastur TEXT,
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Tabla de sesiones (tokens de autenticación)
CREATE TABLE IF NOT EXISTS sesiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(token);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);

-- Tabla principal de presupuestos
CREATE TABLE IF NOT EXISTS presupuestos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT NOT NULL,
    fecha TEXT NOT NULL,
    tipo_viaje TEXT CHECK (tipo_viaje IN ('soloIda', 'idaVuelta', 'multiDestino')),
    tipo_tarifa TEXT CHECK (tipo_tarifa IN ('basic', 'light', 'full', NULL)),

    -- Datos del agente
    agente_id INTEGER NOT NULL,
    agente_nombre TEXT NOT NULL,
    agente_email TEXT NOT NULL,
    agente_telefono TEXT,
    agente_cadastur TEXT,

    -- Datos del cliente
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT,
    cliente_ciudad TEXT,
    destino_final TEXT,
    cantidad_pasajeros INTEGER DEFAULT 1,

    -- Opciones
    incluye_transfer INTEGER DEFAULT 0,
    incluye_seguro INTEGER DEFAULT 0,
    incluye_vehiculo INTEGER DEFAULT 0,

    -- Valores
    moneda TEXT DEFAULT 'USD' CHECK (moneda IN ('USD', 'BRL')),
    valor_por_persona REAL,
    valor_total REAL,

    -- Idioma del presupuesto
    idioma TEXT DEFAULT 'es' CHECK (idioma IN ('es', 'pt')),

    -- Estado y timestamps
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'eliminado')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,

    -- Estado de venta
    vendido INTEGER DEFAULT 0,
    fecha_venta TEXT,

    FOREIGN KEY (agente_id) REFERENCES usuarios(id)
);

-- Índices para presupuestos
CREATE INDEX IF NOT EXISTS idx_presupuestos_agente ON presupuestos(agente_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_estado ON presupuestos(estado);
CREATE INDEX IF NOT EXISTS idx_presupuestos_cliente ON presupuestos(cliente_nombre);
CREATE INDEX IF NOT EXISTS idx_presupuestos_fecha ON presupuestos(created_at DESC);

-- Tabla de vuelos (relación 1:N con presupuestos)
CREATE TABLE IF NOT EXISTS vuelos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    presupuesto_id INTEGER NOT NULL,
    orden INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('ida', 'vuelta')),
    numero TEXT,
    origen TEXT,
    destino TEXT,
    fecha TEXT,
    hora_salida TEXT,
    hora_llegada TEXT,
    aerolinea TEXT,
    duracion TEXT,
    escalas TEXT DEFAULT 'Directo',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE
);

-- Índice para vuelos
CREATE INDEX IF NOT EXISTS idx_vuelos_presupuesto ON vuelos(presupuesto_id);

-- Tabla de hoteles (relación 1:N con presupuestos)
CREATE TABLE IF NOT EXISTS hoteles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    presupuesto_id INTEGER NOT NULL,
    orden INTEGER NOT NULL,
    nombre TEXT,
    url TEXT,
    tipo_cuarto TEXT,
    fecha_entrada TEXT,
    fecha_salida TEXT,
    noches INTEGER,
    regimen TEXT,
    imagen_base64 TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE
);

-- Índice para hoteles
CREATE INDEX IF NOT EXISTS idx_hoteles_presupuesto ON hoteles(presupuesto_id);

-- Tabla de configuración global
CREATE TABLE IF NOT EXISTS configuracion (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Insertar configuración inicial
INSERT OR IGNORE INTO configuracion (clave, valor) VALUES
    ('cadastur_default', '37.286.620/0001-49'),
    ('email_empresa', 'contatofreest@gmail.com'),
    ('ultimo_numero_presupuesto', '0');
`;

async function setupDatabase() {
    console.log('Conectando a Turso...');

    try {
        // Ejecutar cada statement por separado
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log('Ejecutando:', statement.substring(0, 50) + '...');
            await db.execute(statement);
        }

        console.log('\n✅ Base de datos configurada correctamente!');
        console.log('\nTablas creadas:');
        console.log('  - usuarios');
        console.log('  - sesiones');
        console.log('  - presupuestos');
        console.log('  - vuelos');
        console.log('  - hoteles');
        console.log('  - configuracion');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setupDatabase();
