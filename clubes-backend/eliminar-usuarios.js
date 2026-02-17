// --- 1. CONFIGURACIÓN ---
const { Pool } = require('pg');
require('dotenv').config();

console.log("Iniciando script de eliminación...");

const correosParaEliminar = [
    '24114012280017@cbta228.edu.mx',
    '24114012280033@cbta228.edu.mx',
    '24114012280049@cbta228.edu.mx',
    '24114012280097@cbta228.edu.mx',
    '24114012280183@cbta228.edu.mx',
    '24114012280008@cbta228.edu.mx',
    '24114012280037@cbta228.edu.mx',
    '24114012280102@cbta228.edu.mx',
    '24114012280160@cbta228.edu.mx',
    '24114012280137@cbta228.edu.mx',    
    '24114012280140@cbta228.edu.mx',
    '24114012280153@cbta228.edu.mx',
    '24114012280194@cbta228.edu.mx',
    '24114012280198@cbta228.edu.mx',
    '24114012280201@cbta228.edu.mx',
    '24114012280202@cbta228.edu.mx',
    '24114012280221@cbta228.edu.mx',
    '23114012280049@cbta228.edu.mx',
    '23114012280155@cbta228.edu.mx',
    '23114012280162@cbta228.edu.mx',
    '23114012280178@cbta228.edu.mx'    
];

// --- DIAGNÓSTICO: Verificamos si la URL de conexión se está leyendo ---
if (!process.env.DATABASE_URL) {
    console.error("\n❌ ERROR: No se encontró la variable DATABASE_URL en el archivo .env.");
    console.error("Asegúrate de que el archivo .env existe en la misma carpeta y contiene la línea 'DATABASE_URL=...'");
    process.exit(1); // Detiene el script
}
console.log("Variable DATABASE_URL encontrada. Intentando conectar...");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


// --- 2. FUNCIÓN DE ELIMINACIÓN ---
async function eliminarUsuarios() {
    if (!correosParaEliminar || correosParaEliminar.length === 0) {
        console.log("\nLa lista de correos para eliminar está vacía. No se realizó ninguna acción.");
        return;
    }

    const client = await pool.connect();
    console.log("✅ Conexión a la base de datos exitosa.");

    try {
        console.log(`Buscando a ${correosParaEliminar.length} usuarios para eliminar...`);
        
        const query = 'DELETE FROM estudiantes WHERE correo = ANY($1::text[]) RETURNING *';
        const result = await client.query(query, [correosParaEliminar]);

        console.log("\n✅ Proceso de eliminación completado.");

        if (result.rowCount > 0) {
            console.log(`\x1b[32m%s\x1b[0m`, `Total de usuarios eliminados: ${result.rowCount}`);
            console.log("Usuarios que fueron eliminados:");
            result.rows.forEach(user => {
                console.log(`- ${user.nombres} ${user.apellidos} (${user.correo})`);
            });
        } else {
            console.log("\x1b[33m%s\x1b[0m", "No se encontraron usuarios que coincidieran con los correos proporcionados.");
        }

    } catch (err) {
        console.error("\n❌ Error durante la consulta a la base de datos:", err.message);
    } finally {
        await client.release();
        await pool.end();
        console.log("Conexión a la base de datos cerrada.");
    }
}


// --- 3. EJECUCIÓN DEL SCRIPT ---
eliminarUsuarios().catch(err => {
    console.error("\n❌ Fallo general en el script:", err.message);
    pool.end();
});





