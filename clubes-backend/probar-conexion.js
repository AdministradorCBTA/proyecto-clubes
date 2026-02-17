// probar-conexion.js
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log("Intentando conectar a la base de datos...");
    try {
        const connection = await mysql.createConnection({
            host: '174.136.31.132', // Reemplaza esto con la IP de tu cPanel
            user: 'cbtaedu8_admin_clubes',  // Reemplaza esto con tu usuario de BD
            password: '*club@25#228', // Reemplaza esto con tu contraseña
            database: 'cbtaedu8_clubes'  // Reemplaza esto con el nombre de tu BD
        });
        console.log("\n✅ ¡Conexión a la base de datos exitosa!");
        await connection.end();
    } catch (error) {
        console.error("\n❌ Error al conectar a la base de datos:");
        console.error(error.message);
    }
}

testConnection();