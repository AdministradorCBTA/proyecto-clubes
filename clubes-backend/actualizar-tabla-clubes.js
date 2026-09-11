const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function agregarInstructor() {
  const client = await pool.connect();
  try {
    await client.query('ALTER TABLE clubes ADD COLUMN IF NOT EXISTS instructor VARCHAR(150);');
    console.log('✅ Columna "instructor" agregada correctamente a la tabla clubes.');
  } catch (err) {
    console.error('❌ Error al actualizar la tabla:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

agregarInstructor();