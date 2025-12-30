// Migración: Agregar campos vendido y fecha_venta a presupuestos
// Ejecutar: node scripts/migrate-add-vendido.js

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function migrate() {
    console.log('Conectando a Turso...');

    try {
        // Verificar si la columna ya existe
        const tableInfo = await db.execute("PRAGMA table_info(presupuestos)");
        const columns = tableInfo.rows.map(row => row.name);

        if (columns.includes('vendido')) {
            console.log('⚠️  La columna "vendido" ya existe. Migración no necesaria.');
            return;
        }

        console.log('Agregando columna "vendido"...');
        await db.execute('ALTER TABLE presupuestos ADD COLUMN vendido INTEGER DEFAULT 0');

        console.log('Agregando columna "fecha_venta"...');
        await db.execute('ALTER TABLE presupuestos ADD COLUMN fecha_venta TEXT');

        console.log('\n✅ Migración completada!');
        console.log('Columnas agregadas a tabla presupuestos:');
        console.log('  - vendido (INTEGER DEFAULT 0)');
        console.log('  - fecha_venta (TEXT)');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

migrate();
