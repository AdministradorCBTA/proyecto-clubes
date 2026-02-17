const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a Neon (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tomamos el correo electrónico desde la terminal
const emailParaVerificar = process.argv[2];

if (!emailParaVerificar) {
    console.error("❌ Por favor, proporciona un correo. Ejemplo: node verificar-estudiante.js alumno@cbta228.edu.mx");
    process.exit(1);
}

async function verificarEnNeon() {
    const client = await pool.connect();
    console.log(`🔍 Buscando a '${emailParaVerificar}' en la base de datos de Neon...`);

    try {
        const query = "SELECT id, correo, nombres, apellidos, password FROM estudiantes WHERE correo = $1";
        const res = await client.query(query, [emailParaVerificar.trim().toLowerCase()]);

        if (res.rows.length > 0) {
            console.log("\n✅ ¡Estudiante encontrado!");
            console.table(res.rows[0]); // Muestra los datos en una tabla bonita en consola
        } else {
            console.log(`\n❌ El correo '${emailParaVerificar}' NO existe en la base de datos de Neon.`);
            console.log("Tip: Asegúrate de haber corrido 'node importar-google.js' primero.");
        }
    } catch (err) {
        console.error("❌ Error en la consulta:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

verificarEnNeon();