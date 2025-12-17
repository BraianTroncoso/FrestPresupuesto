// Script para crear usuario admin inicial
// Ejecutar: node scripts/seed-users.js

import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function seedUsers() {
    console.log('Creando usuario admin inicial...\n');

    try {
        // Verificar si ya existe un admin
        const existing = await db.execute("SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1");

        if (existing.rows.length > 0) {
            console.log('⚠️  Ya existe un usuario admin. Saltando...');
            return;
        }

        // Crear usuario admin
        // IMPORTANTE: Cambiar estos valores en producción!
        const adminEmail = 'admin@freest.com';
        const adminPassword = 'admin123'; // Cambiar en producción!
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        await db.execute(
            'INSERT INTO usuarios (email, password_hash, nombre, rol, telefono, cadastur) VALUES (?, ?, ?, ?, ?, ?)',
            [adminEmail, passwordHash, 'Administrador', 'admin', '(11) 99999-9999', '37.286.620/0001-49']
        );

        console.log('✅ Usuario admin creado:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('\n⚠️  IMPORTANTE: Cambiar la contraseña en producción!');

        // Crear un agente de ejemplo
        const agenteEmail = 'agente@freest.com';
        const agentePassword = 'agente123';
        const agentePasswordHash = await bcrypt.hash(agentePassword, 10);

        await db.execute(
            'INSERT INTO usuarios (email, password_hash, nombre, rol, telefono, cadastur) VALUES (?, ?, ?, ?, ?, ?)',
            [agenteEmail, agentePasswordHash, 'Agente Demo', 'agente', '(11) 88888-8888', '37.286.620/0001-49']
        );

        console.log('\n✅ Usuario agente de prueba creado:');
        console.log(`   Email: ${agenteEmail}`);
        console.log(`   Password: ${agentePassword}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedUsers();
