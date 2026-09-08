// --- 1. IMPORTACIONES DE LIBRERÍAS ---
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const exceljs = require('exceljs');

// --- 2. CONFIGURACIÓN INICIAL ---
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-aqui';

// --- 3. CONEXIÓN A LA BASE DE DATOS NEON (PostgreSQL) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- 4. MIDDLEWARES ---
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/imagenes', express.static('public/images'));


// --- 5. RUTAS DE LA APLICACIÓN ---

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

// Buscar estudiante por CURP
app.get('/estudiante/curp/:curp', async (req, res) => {
  const curpBusqueda = req.params.curp.trim().toUpperCase();
  try {
    const result = await pool.query(
      'SELECT curp, nombre_completo AS nombre, grado_grupo AS semestre FROM estudiantes WHERE UPPER(curp) = $1',
      [curpBusqueda]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'CURP no encontrada en el padrón de alumnos.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al consultar estudiante por CURP:', err);
    res.status(500).json({ mensaje: 'Error en el servidor al consultar CURP.' });
  }
});

// Inscribir a un estudiante en un club por CURP
app.post('/inscribir', async (req, res) => {
    const { curp, clubId } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const curpLimpia = curp ? curp.trim().toUpperCase() : '';
        const estRes = await client.query('SELECT * FROM estudiantes WHERE UPPER(curp) = $1', [curpLimpia]);
        if (estRes.rows.length === 0) throw new Error("La CURP no se encuentra registrada.");

        const estudiante = estRes.rows[0];

        const insRes = await client.query('SELECT * FROM inscripciones WHERE id_estudiante = $1', [estudiante.id]);
        if (insRes.rows.length > 0) throw new Error("Este estudiante ya se encuentra inscrito en un club.");

        const clubRes = await client.query('SELECT * FROM clubes WHERE id = $1 FOR UPDATE', [clubId]);
        if (clubRes.rows.length === 0) throw new Error("El club seleccionado no existe.");
        if (clubRes.rows[0].inscritos_actuales >= clubRes.rows[0].cupo_maximo) throw new Error("El club ya no tiene cupos disponibles.");

        await client.query('INSERT INTO inscripciones (id_estudiante, id_club) VALUES ($1, $2)', [estudiante.id, clubId]);
        await client.query('UPDATE clubes SET inscritos_actuales = inscritos_actuales + 1 WHERE id = $1', [clubId]);
        
        await client.query('COMMIT');
        res.status(200).json({ mensaje: `¡Felicidades, ${estudiante.nombre_completo}! Te has inscrito correctamente.` });
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

// Middleware de protección
const protegerRuta = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Crear club
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

// Actualizar club
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

// Eliminar club
app.delete('/clubes/:id', protegerRuta, async (req, res) => {
    const { id } = req.params;
    try {
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
            SELECT c.nombre as nombre_club, s.curp, s.nombre_completo, s.grado_grupo
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
            { header: 'CURP', key: 'curp', width: 22 },
            { header: 'Nombre Completo', key: 'nombre_completo', width: 35 },
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

// Obtener lista de imágenes disponibles
app.get('/api/imagenes-disponibles', (req, res) => {
    const directorioImagenes = path.join(__dirname, 'public/images');

    fs.readdir(directorioImagenes, (err, archivos) => {
        if (err) {
            console.error("Error al leer la carpeta de imágenes:", err);
            return res.status(500).json({ mensaje: "No se pudieron cargar las imágenes." });
        }

        const imagenes = archivos.filter(archivo => {
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(archivo);
        });

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