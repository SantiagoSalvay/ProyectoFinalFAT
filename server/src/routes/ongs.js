import express from 'express';
import { getDatabase } from '../database/init.js';

const router = express.Router();

// Obtener todas las ONGs
router.get('/', async (req, res) => {
  try {
    const { type, location, search } = req.query;
    const db = await getDatabase();

    let query = `
      SELECT o.*, 
             COUNT(DISTINCT d.id) as total_donations,
             COUNT(DISTINCT v.id) as total_volunteers,
             AVG(r.rating) as average_rating,
             COUNT(r.id) as rating_count
      FROM ongs o
      LEFT JOIN donations d ON o.id = d.ong_id
      LEFT JOIN volunteering v ON o.id = v.ong_id
      LEFT JOIN ong_ratings r ON o.id = r.ong_id
    `;

    const conditions = [];
    const params = [];

    if (type) {
      conditions.push('o.type = ?');
      params.push(type);
    }

    if (location) {
      conditions.push('o.location LIKE ?');
      params.push(`%${location}%`);
    }

    if (search) {
      conditions.push('(o.name LIKE ? OR o.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY o.id ORDER BY o.impact_score DESC';

    const ongs = await db.all(query, params);

    res.json({ ongs });
  } catch (error) {
    console.error('Error al obtener ONGs:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener ONG por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const ong = await db.get(`
      SELECT o.*, 
             COUNT(DISTINCT d.id) as total_donations,
             COUNT(DISTINCT v.id) as total_volunteers,
             AVG(r.rating) as average_rating,
             COUNT(r.id) as rating_count
      FROM ongs o
      LEFT JOIN donations d ON o.id = d.ong_id
      LEFT JOIN volunteering v ON o.id = v.ong_id
      LEFT JOIN ong_ratings r ON o.id = r.ong_id
      WHERE o.id = ?
      GROUP BY o.id
    `, [id]);

    if (!ong) {
      return res.status(404).json({ error: 'ONG no encontrada' });
    }

    // Obtener comentarios de la ONG
    const comments = await db.all(`
      SELECT c.*, u.name as user_name, u.role as user_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.ong_id = ?
      ORDER BY c.created_at DESC
    `, [id]);

    // Obtener publicaciones del foro de la ONG
    const posts = await db.all(`
      SELECT fp.*, u.name as author_name, u.role as author_role
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.ong_id = ?
      ORDER BY fp.created_at DESC
    `, [id]);

    res.json({ 
      ong: { ...ong, comments, posts }
    });
  } catch (error) {
    console.error('Error al obtener ONG:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva ONG (solo usuarios autenticados con rol 'ong')
router.post('/', async (req, res) => {
  try {
    const { name, description, type, location, latitude, longitude, website, phone, email } = req.body;
    const db = await getDatabase();

    const result = await db.run(`
      INSERT INTO ongs (name, description, type, location, latitude, longitude, website, phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, type, location, latitude, longitude, website, phone, email]);

    const newOng = await db.get('SELECT * FROM ongs WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'ONG creada exitosamente',
      ong: newOng
    });
  } catch (error) {
    console.error('Error al crear ONG:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar ONG
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, location, latitude, longitude, website, phone, email } = req.body;
    const db = await getDatabase();

    await db.run(`
      UPDATE ongs 
      SET name = ?, description = ?, type = ?, location = ?, latitude = ?, longitude = ?, 
          website = ?, phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, description, type, location, latitude, longitude, website, phone, email, id]);

    const updatedOng = await db.get('SELECT * FROM ongs WHERE id = ?', [id]);

    if (!updatedOng) {
      return res.status(404).json({ error: 'ONG no encontrada' });
    }

    res.json({
      message: 'ONG actualizada exitosamente',
      ong: updatedOng
    });
  } catch (error) {
    console.error('Error al actualizar ONG:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Calificar ONG
router.post('/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    const db = await getDatabase();

    // Verificar si ya calificó
    const existingRating = await db.get('SELECT * FROM ong_ratings WHERE user_id = ? AND ong_id = ?', [decoded.userId, id]);
    
    if (existingRating) {
      // Actualizar calificación existente
      await db.run('UPDATE ong_ratings SET rating = ?, comment = ? WHERE user_id = ? AND ong_id = ?', 
        [rating, comment, decoded.userId, id]);
    } else {
      // Crear nueva calificación
      await db.run('INSERT INTO ong_ratings (user_id, ong_id, rating, comment) VALUES (?, ?, ?, ?)', 
        [decoded.userId, id, rating, comment]);
    }

    // Recalcular rating promedio
    const avgRating = await db.get('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM ong_ratings WHERE ong_id = ?', [id]);
    
    await db.run('UPDATE ongs SET rating = ?, rating_count = ? WHERE id = ?', 
      [avgRating.avg_rating, avgRating.count, id]);

    res.json({
      message: 'Calificación guardada exitosamente',
      rating: { rating, comment }
    });
  } catch (error) {
    console.error('Error al calificar ONG:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Comentar en ONG
router.post('/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    const db = await getDatabase();

    const result = await db.run('INSERT INTO comments (user_id, ong_id, content) VALUES (?, ?, ?)', 
      [decoded.userId, id, content]);

    const newComment = await db.get(`
      SELECT c.*, u.name as user_name, u.role as user_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.lastID]);

    res.status(201).json({
      message: 'Comentario agregado exitosamente',
      comment: newComment
    });
  } catch (error) {
    console.error('Error al comentar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 