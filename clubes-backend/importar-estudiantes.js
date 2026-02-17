const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a Neon
const pool = new Pool({
connectionString: process.env.DATABASE_URL,
});

const csvFilePath = './estudiantes.csv';
let registrosIngresados = 0;
let registrosOmitidos = 0;

async function importarEstudiantes() {
const client = await pool.connect();
console.log("📂 Iniciando lectura de estudiantes.csv...");

try {
    const stream = fs.createReadStream(csvFilePath).pipe(csv());

    for await (const row of stream) {
        // Limpieza de datos (quitar espacios en blanco accidentales)
        const correoLimpio = row.correo ? row.correo.trim().toLowerCase() : '';
        
        if (correoLimpio !== '') {
            try {
                // Lógica de contraseña: Si viene vacía en el CSV, se guarda como texto vacío ''
                const contrasenaFinal = row.contrasena ? row.contrasena.trim() : '';
                
                // Usamos ON CONFLICT DO NOTHING para no duplicar correos
                const result = await client.query(
                    `INSERT INTO estudiantes (correo, nombres, apellidos, carrera, grado_grupo, contrasena) 
                     VALUES ($1, $2, $3, $4, $5, $6) 
                     ON CONFLICT (correo) DO NOTHING`,
                    [
                        correoLimpio, 
                        row.nombres ? row.nombres.trim() : '', 
                        row.apellidos ? row.apellidos.trim() : '', 
                        row.carrera ? row.carrera.trim() : '', 
                        row.grado_grupo ? row.grado_grupo.trim() : '', 
                        contrasenaFinal
                    ]
                );

                if (result.rowCount > 0) {
                    registrosIngresados++;
                    console.log(`✅ Importado: ${correoLimpio}`);
                } else {
                    registrosOmitidos++;
                }

            } catch (err) {
                console.error(`❌ Error en registro ${correoLimpio}:`, err.message);
            }
        }
    }
} catch (err) {
    console.error("❌ Error al leer el archivo CSV:", err.message);
} finally {
    client.release();
    await pool.end();
    console.log('\n--- RESUMEN DE IMPORTACIÓN ---');
    console.log(`Nuevos alumnos registrados: ${registrosIngresados}`);
    console.log(`Alumnos omitidos (ya existían): ${registrosOmitidos}`);
    console.log('------------------------------');
}


}

importarEstudiantes().catch(err => console.error("Fallo crítico:", err));