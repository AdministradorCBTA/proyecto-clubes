const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function asignarInstructores() {
  const client = await pool.connect();
  try {
    // Asigna el instructor buscando por el NOMBRE del club
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['M.T.I. LUCIO ARELLANO CAMPOS', 'AJEDREZ']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['M.T.I. LUCIO ARELLANO CAMPOS', 'ROBOTICA']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['LIC. WENDY GUADALUPE ARROLLO LAGUNAS', 'PRIMEROS AUXILIOS']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['ING. FAVIOLA CAROLINA CONTRERAS JUAREZ', 'FUTBOL MUJERES']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['LIC. ANABEL AIDA DUEÑAS ARMAS', 'PERIODICO MURAL']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['M.V.Z. JUAN DE DIOS GALINDO HERNANDEZ', 'COCINA']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['ING. CYNTHIA GUADALUPE GOMEZ CAMPOS', 'ROMPECABEZAS']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['LIC. HELEODORO HERRERA REYES', 'BANDA DE GUERRA, DANZA Y BAILE']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['ING. RAMIRO JOSUE HERRERA REYES', 'VOLIBOL MIXTO']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['M.E.T. ALBA NELLY RAMIREZ RAMIREZ', 'BASQUETBOL MIXTO']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['M.E.T. ALBA NELLY RAMIREZ RAMIREZ', 'FARMACIA VIVIENTE']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['ING. MARTHA CRISTINA VELAZQUEZ ENCISO', 'BORDADO DE SERVILLETAS']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['ING. JUAN ANTONIO LOPEZ TORREZ', 'PERIODISMO']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['M.C. FÁTIMA MAGDALENA SANDOVAL BECERRA', 'DIBUJO']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['LIC. MONICA GUDALUPE ALDANA GARCIA ', 'FOMI MOLDEABLE']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['M.C. GETSEMANI RAMIREZ HUERTA', 'GALERIA BOTÁNICA']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['LIC. OSCAR TODD CERVANTES', 'ATLETISMO']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['', 'FUTBOL HOMBRES']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['MVZ. MARÍA GUTIÉRREZ RUVALCABA', 'APLICACIÓN DE UÑAS']);
    await client.query("UPDATE clubes SET instructor = $1 WHERE UPPER(nombre) = UPPER($2)", ['ESTUDIANTE JENNIFER HUERTA ZARAGOZA', 'MÚSICA']);    


    console.log('✅ Instructores asignados correctamente.');
  } catch (err) {
    console.error('❌ Error al asignar instructores:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

asignarInstructores();