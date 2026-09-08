const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a Neon (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const csvFilePath = './estudiantes.csv';
let totalFilas = 0;
let registrosProcesados = 0;
let registrosErrores = 0;
let registrosSaltados = 0;

async function importarEstudiantes() {
    if (!fs.existsSync(csvFilePath)) {
        console.error("❌ ERROR: No se encuentra 'estudiantes.csv' en la carpeta actual.");
        process.exit(1);
    }

    const client = await pool.connect();
    console.log("📂 Conectado a Neon. Verificando estructura y preparando base de datos...");

    try {
        // 1. Asegurar la existencia de la tabla base
        await client.query(`
            CREATE TABLE IF NOT EXISTS estudiantes (
                id SERIAL PRIMARY KEY
            );
        `);

        // 2. Agregar automáticamente las columnas faltantes si no existen en Neon
        await client.query(`
            ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS curp VARCHAR(18);
            ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(255);
            ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS grado_grupo VARCHAR(50);
        `);

        // 3. Quitar restricción NOT NULL de columnas antiguas si existen
        await client.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'estudiantes' AND column_name = 'correo'
                ) THEN
                    ALTER TABLE estudiantes ALTER COLUMN correo DROP NOT NULL;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'estudiantes' AND column_name = 'carrera'
                ) THEN
                    ALTER TABLE estudiantes ALTER COLUMN carrera DROP NOT NULL;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'estudiantes' AND column_name = 'nombres'
                ) THEN
                    ALTER TABLE estudiantes ALTER COLUMN nombres DROP NOT NULL;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'estudiantes' AND column_name = 'apellidos'
                ) THEN
                    ALTER TABLE estudiantes ALTER COLUMN apellidos DROP NOT NULL;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'estudiantes' AND column_name = 'contrasena'
                ) THEN
                    ALTER TABLE estudiantes ALTER COLUMN contrasena DROP NOT NULL;
                END IF;
            END $$;
        `);

        // 4. Agregar restricción de unicidad para la CURP
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'estudiantes_curp_key'
                ) THEN
                    ALTER TABLE estudiantes ADD CONSTRAINT estudiantes_curp_key UNIQUE (curp);
                END IF;
            END $$;
        `);

        // --- LÍNEA DE LIMPIEZA TOTAL ---
        // Vacia la tabla de estudiantes y reinicia los contadores de ID
        console.log("🧹 Vaciando la tabla de estudiantes para reiniciar el padrón a 0...");
        await client.query('TRUNCATE TABLE estudiantes RESTART IDENTITY CASCADE;');
        console.log("✅ Base de datos de estudiantes reiniciada a 0 correctamente.");

        // 5. Lectura e inserción del archivo CSV
        const stream = fs.createReadStream(csvFilePath).pipe(csv({
            mapHeaders: ({ header }) => header.trim().toLowerCase()
        }));

        for await (const row of stream) {
            totalFilas++;
            
            const curpLimpia = row.curp ? row.curp.trim().toUpperCase() : '';
            const nombreLimpio = row.nombre_completo ? row.nombre_completo.trim().toUpperCase() : '';
            const gradoGrupoLimpio = row.grado_grupo ? row.grado_grupo.trim().toUpperCase() : '';

            if (curpLimpia.length === 18) {
                try {
                    await client.query(
                        `INSERT INTO estudiantes (curp, nombre_completo, grado_grupo) 
                         VALUES ($1, $2, $3)`,
                        [curpLimpia, nombreLimpio, gradoGrupoLimpio]
                    );

                    registrosProcesados++;
                } catch (err) {
                    registrosErrores++;
                    console.error(`❌ Error al procesar CURP ${curpLimpia}:`, err.message);
                }
            } else {
                registrosSaltados++;
                console.warn(`⚠️ Fila ${totalFilas} omitida: CURP inválida o vacía ('${curpLimpia}')`);
            }
        }
    } catch (err) {
        console.error("❌ Error en la preparación de la base de datos o lectura del CSV:", err.message);
    } finally {
        console.log('\n⏳ Verificando conteo final en la base de datos...');
        const countResult = await client.query('SELECT COUNT(*) FROM estudiantes');
        const totalReal = countResult.rows[0].count;

        client.release();
        await pool.end();

        console.log('\n========================================');
        console.log('🏁 IMPORTACIÓN DESDE CERO COMPLETADA');
        console.log(`📄 Total de filas leídas: ${totalFilas}`);
        console.log(`✅ Registros ingresados: ${registrosProcesados}`);
        console.log(`🔢 TOTAL FINAL EN LA BASE DE DATOS: ${totalReal}`);
        console.log(`⚠️ Filas omitidas: ${registrosSaltados}`);
        console.log(`❌ Errores de BD: ${registrosErrores}`);
        console.log('========================================');
    }
}

importarEstudiantes().catch(err => console.error("Fallo crítico:", err));