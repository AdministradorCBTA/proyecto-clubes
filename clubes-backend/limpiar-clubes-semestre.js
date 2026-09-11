const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function resetearClubes() {
  const client = await pool.connect();
  console.log("🧹 Iniciando vaciado de catálogo de clubes e inscripciones...");

  try {
    // 1. Eliminar inscripciones existentes
    await client.query("DELETE FROM inscripciones;");
    console.log("✅ Inscripciones borradas.");

    // 2. Eliminar clubes del semestre anterior
    await client.query("DELETE FROM clubes;");
    console.log("✅ Catálogo de clubes vaciado correctamente.");

    // 3. Reiniciar la secuencia de ID de la tabla clubes a 1
    await client.query("ALTER SEQUENCE clubes_id_seq RESTART WITH 1;");
    console.log("✅ Contador de ID de clubes reiniciado a 1.");

    console.log("\n🚀 La base de datos está totalmente lista para agregar la oferta de clubes del nuevo semestre.");
  } catch (err) {
    console.error("❌ Error al reiniciar catálogo de clubes:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetearClubes();