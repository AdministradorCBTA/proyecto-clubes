const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verClubes() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, nombre, instructor FROM clubes ORDER BY id ASC;');
    console.log('\n📋 Lista de clubes en Neon:');
    console.table(res.rows);
  } catch (err) {
    console.error('❌ Error al consultar clubes:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verClubes();