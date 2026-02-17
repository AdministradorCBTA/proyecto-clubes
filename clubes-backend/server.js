// --- 1. IMPORTACIONES DE LIBRERÍAS ---
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg'); // Usamos el conector de PostgreSQL
const exceljs = require('exceljs');

// --- 2. CONFIGURACIÓN INICIAL ---
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-aqui';

// --- 3. CONEXIÓN A LA BASE DE DATOS NEON (PostgreSQL) ---
// La URL de conexión se toma de las variables de entorno de Render para mayor seguridad.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- 4. MIDDLEWARES ---

// Configuración de CORS para permitir peticiones solo desde tu dominio
const corsOptions = {
  origin: 'https://cbta228.edu.mx',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Permite que el servidor entienda datos en formato JSON
app.use(express.json());

// Sirve las imágenes que están en la carpeta 'public/images'
app.use('/imagenes', express.static('public/images'));


// --- 5. RUTAS DE LA APLICACIÓN ---

// --- RUTAS PÚBLICAS (No necesitan token) ---

// Obtener la lista de todos los clubes
app.get('/clubes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clubes ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error en GET /clubes:", err);
        res.status(500).json({ mensaje: 'Error al obtener los clubes.' });
    }
});

// Inscribir a un estudiante en un club
app.post('/inscribir', async (req, res) => {
    const { email, clubId } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const estRes = await client.query('SELECT * FROM estudiantes WHERE correo = $1', [email]);
        if (estRes.rows.length === 0) throw new Error("El correo electrónico no está registrado.");

        const insRes = await client.query('SELECT * FROM inscripciones WHERE id_estudiante = $1', [estRes.rows[0].id]);
        if (insRes.rows.length > 0) throw new Error("Ya estás inscrito en un club.");

        const clubRes = await client.query('SELECT * FROM clubes WHERE id = $1 FOR UPDATE', [clubId]);
        if (clubRes.rows.length === 0) throw new Error("El club no existe.");
        if (clubRes.rows[0].inscritos_actuales >= clubRes.rows[0].cupo_maximo) throw new Error("El club ya está lleno.");

        await client.query('INSERT INTO inscripciones (id_estudiante, id_club) VALUES ($1, $2)', [estRes.rows[0].id, clubId]);
        await client.query('UPDATE clubes SET inscritos_actuales = inscritos_actuales + 1 WHERE id = $1', [clubId]);
        
        await client.query('COMMIT');
        res.status(200).json({ mensaje: `¡Felicidades, ${estRes.rows[0].nombres}! Te has inscrito.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error en /inscribir:", err);
        res.status(400).json({ mensaje: err.message });
    } finally {
        client.release();
    }
});

// Login para el panel de administrador
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const resAdmin = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (resAdmin.rows.length === 0) return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos." });
        
        const admin = resAdmin.rows[0];
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos." });
        
        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ token });
    } catch (err) {
        console.error("Error en /api/login:", err);
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// --- MIDDLEWARE DE AUTENTICACIÓN (El "guardián" de las rutas protegidas) ---
const protegerRuta = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"
    if (token == null) return res.sendStatus(401); // No hay token

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // El token es inválido o expiró
        req.user = user;
        next(); // Permite continuar a la ruta solicitada
    });
};


// --- RUTAS PROTEGIDAS (Requieren un token válido) ---

// Crear un nuevo club
app.post('/clubes', protegerRuta, async (req, res) => {
    const { nombre, cupo_maximo, url_imagen } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO clubes (nombre, cupo_maximo, url_imagen, inscritos_actuales) VALUES ($1, $2, $3, 0) RETURNING *',
            [nombre, cupo_maximo, url_imagen]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error en POST /clubes:", err);
        res.status(500).json({ mensaje: 'Error al crear el club.' });
    }
});

// Actualizar un club existente
app.put('/clubes/:id', protegerRuta, async (req, res) => {
    const { id } = req.params;
    const { nombre, cupo_maximo, url_imagen } = req.body;
    try {
        const result = await pool.query(
            'UPDATE clubes SET nombre = $1, cupo_maximo = $2, url_imagen = $3 WHERE id = $4 RETURNING *',
            [nombre, cupo_maximo, url_imagen, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Club no encontrado.' });
        }
        res.status(200).json({ mensaje: 'Club actualizado correctamente.' });
    } catch (err) {
        console.error("Error en PUT /clubes/:id:", err);
        res.status(500).json({ mensaje: 'Error al actualizar el club.' });
    }
});

// Eliminar un club
app.delete('/clubes/:id', protegerRuta, async (req, res) => {
    const { id } = req.params;
    try {
        // La eliminación en cascada (ON DELETE CASCADE) en la base de datos
        // se encargará de borrar las inscripciones asociadas.
        const result = await pool.query('DELETE FROM clubes WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Club no encontrado.' });
        }
        res.status(200).json({ mensaje: 'Club eliminado correctamente.' });
    } catch (err) {
        console.error("Error en DELETE /clubes/:id:", err);
        res.status(500).json({ mensaje: 'Error al eliminar el club.' });
    }
});

// Exportar la lista de inscritos a Excel
app.get('/exportar/:clubId', protegerRuta, async (req, res) => {
    const { clubId } = req.params;
    try {
        const query = `
            SELECT c.nombre as nombre_club, s.nombres, s.apellidos, s.correo, s.carrera, s.grado_grupo
            FROM estudiantes s
            JOIN inscripciones i ON s.id = i.id_estudiante
            JOIN clubes c ON c.id = i.id_club
            WHERE i.id_club = $1`;
        const result = await pool.query(query, [clubId]);
        const filas = result.rows;
        
        if (filas.length === 0) {
            return res.status(404).json({ mensaje: "No hay estudiantes inscritos en este club." });
        }

        const nombreClub = filas[0].nombre_club;
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet(`Inscritos en ${nombreClub}`);
        worksheet.columns = [
            { header: 'Nombres', key: 'nombres', width: 20 },
            { header: 'Apellidos', key: 'apellidos', width: 20 },
            { header: 'Correo Electrónico', key: 'correo', width: 30 },
            { header: 'Carrera', key: 'carrera', width: 15 },
            { header: 'Grado y Grupo', key: 'grado_grupo', width: 15 }
        ];
        worksheet.addRows(filas);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Inscritos-${nombreClub.replace(/ /g, "_")}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Error en /exportar/:clubId:", err);
        res.status(500).json({ mensaje: 'Error al generar el archivo de Excel.' });
    }
});

// --- NUEVA RUTA: Obtener lista de imágenes disponibles en el servidor ---
app.get('/api/imagenes-disponibles', (req, res) => {
    const directorioImagenes = path.join(__dirname, 'public/images');

    // Leemos el contenido de la carpeta
    fs.readdir(directorioImagenes, (err, archivos) => {
        if (err) {
            console.error("Error al leer la carpeta de imágenes:", err);
            return res.status(500).json({ mensaje: "No se pudieron cargar las imágenes." });
        }

        // Filtramos para dejar solo archivos de imagen (jpg, png, webp, etc.)
        const imagenes = archivos.filter(archivo => {
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(archivo);
        });

        // Construimos la URL completa para cada imagen
        // Usamos la variable de entorno RENDER_EXTERNAL_URL si existe (producción), o localhost (local)
        const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
        
        const listaImagenes = imagenes.map(archivo => ({
            nombre: archivo,
            url: `${baseUrl}/imagenes/${archivo}`
        }));

        res.json(listaImagenes);
    });
});

// --- 6. INICIAR EL SERVIDOR ---
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));