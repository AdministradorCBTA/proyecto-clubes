const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a Neon (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tomamos la CURP desde los argumentos de la terminal
const curpParaVerificar = process.argv[2];

if (!curpParaVerificar) {
    console.error("❌ Por favor, proporciona una CURP. Ejemplo: node verificar-estudiante.js GUAP050315HJCXRR01");
    process.exit(1);
}

async function verificarEnNeon() {
    const client = await pool.connect();
    const curpLimpia = curpParaVerificar.trim().toUpperCase();
    console.log(`🔍 Buscando CURP '${curpLimpia}' en la base de datos de Neon...`);

    try {
        const query = "SELECT id, curp, nombre_completo, grado_grupo FROM estudiantes WHERE UPPER(curp) = $1";
        const res = await client.query(query, [curpLimpia]);

        if (res.rows.length > 0) {
            console.log("\n✅ ¡Estudiante encontrado!");
            console.table(res.rows[0]); // Muestra los datos en una tabla ordenada en la consola
        } else {
            console.log(`\n❌ La CURP '${curpLimpia}' NO existe en la base de datos de Neon.`);
            console.log("Tip: Asegúrate de haber ejecutado 'node importar-estudiantes.js' con tu archivo 'estudiantes.csv'.");
        }
    } catch (err) {
        console.error("❌ Error en la consulta:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

verificarEnNeon();