const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function reiniciarSemestre() {
  const client = await pool.connect();
  try {
    console.log("🧹 Borrando inscripciones del semestre anterior...");
    await client.query("DELETE FROM inscripciones;");
    
    console.log("🔄 Reiniciando contadores de cupo ocupado en los clubes...");
    await client.query("UPDATE clubes SET inscritos_actuales = 0;");
    
    console.log("✅ Base de datos limpia y lista para el nuevo semestre.");
  } catch (err) {
    console.error("❌ Error al reiniciar semestre:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

reiniciarSemestre();