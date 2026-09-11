const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function corregirBaseDatos() {
  const client = await pool.connect();
  console.log("🔧 Iniciando corrección y blindaje de la Base de Datos...");

  try {
    // 1. Eliminar inscripciones con identificadores inválidos (correos o textos que no midan 18 caracteres)
    const resCorreo = await client.query(`
      DELETE FROM inscripciones 
      WHERE LENGTH(TRIM(curp)) != 18;
    `);
    console.log(`🧹 Inscripciones con correo/texto inválido eliminadas: ${resCorreo.rowCount}`);

    // 2. Eliminar inscripciones duplicadas (conserva solo la más antigua por CURP)
    const resDuplicados = await client.query(`
      DELETE FROM inscripciones
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM inscripciones
        GROUP BY UPPER(TRIM(curp))
      );
    `);
    console.log(`🧹 Inscripciones duplicadas eliminadas: ${resDuplicados.rowCount}`);

    // 3. Reajustar el conteo real de inscritos en cada club
    await client.query(`
      UPDATE clubes c
      SET inscritos_actuales = (
        SELECT COUNT(*) 
        FROM inscripciones i 
        WHERE i.club_id = c.id
      );
    `);
    console.log("✅ Conteo de inscritos por club recalculado correctamente.");

    // 4. CANDADO FÍSICO EN BD: Agregar restricción UNIQUE en inscripciones(curp)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'uq_estudiante_inscrito_club'
        ) THEN
          ALTER TABLE inscripciones ADD CONSTRAINT uq_estudiante_inscrito_club UNIQUE (curp);
        END IF;
      END $$;
    `);
    console.log("🔒 CANDADO APLICADO: La base de datos ahora prohíbe múltiples inscripciones por CURP.");

  } catch (err) {
    console.error("❌ Error durante la corrección:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

corregirBaseDatos();