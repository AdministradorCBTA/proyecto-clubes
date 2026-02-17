const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Conexión a la base de datos en la nube (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para algunas conexiones SSL externas
  }
});

// --- CONFIGURACIÓN DE TU USUARIO ---
const adminUsername = 'admin';
const adminPassword = '*club@25#'; // Tu contraseña deseada
const saltRounds = 10;
// ----------------------------------

async function gestionarAdmin() {
    const client = await pool.connect();
    try {
        console.log("🔌 Conectando a la base de datos Neon...");

        // 1. Asegurarnos de que la tabla exista
        await client.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL
            );
        `);

        // 2. Encriptar la contraseña
        const hash = await bcrypt.hash(adminPassword, saltRounds);
        console.log("🔐 Contraseña encriptada.");

        // 3. Insertar o Actualizar (Upsert)
        // Si el usuario 'admin' ya existe, le cambia la contraseña. Si no, lo crea.
        const query = `
            INSERT INTO admins (username, password_hash)
            VALUES ($1, $2)
            ON CONFLICT (username) 
            DO UPDATE SET password_hash = $2
            RETURNING id;
        `;
        
        const res = await client.query(query, [adminUsername, hash]);
        
        console.log(`\n✅ ¡Éxito! Usuario administrador configurado.`);
        console.log(`👤 Usuario: ${adminUsername}`);
        console.log(`🔑 Contraseña: ${adminPassword}`);
        console.log(`🆔 ID en Base de Datos: ${res.rows[0].id}`);

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

gestionarAdmin();