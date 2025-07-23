import express from 'express';
import { getDatabase } from '../database/init.js';

const router = express.Router();

// Obtener todas las publicaciones del foro
router.get('/posts', async (req, res) => {
  try {
    const { filter, search, tags } = req.query;
    const db = await getDatabase();

    let query = `
      SELECT fp.*, u.name as author_name, u.role as author_role, o.name as ong_name
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN ongs o ON fp.ong_id = o.id
    `;

    const conditions = [];
    const params = [];

    if (filter && filter !== 'all') {
      conditions.push('fp.tags LIKE ?');
      params.push(`%${filter}%`);
    }

    if (search) {
      conditions.push('(fp.title LIKE ? OR fp.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tags) {
      conditions.push('fp.tags LIKE ?');
      params.push(`%${tags}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY fp.created_at DESC';

    const posts = await db.all(query, params);

    res.json({ posts });
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener publicación específica
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const post = await db.get(`
      SELECT fp.*, u.name as author_name, u.role as author_role, o.name as ong_name
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN ongs o ON fp.ong_id = o.id
      WHERE fp.id = ?
    `, [id]);

    if (!post) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Obtener comentarios de la publicación
    const comments = await db.all(`
      SELECT c.*, u.name as user_name, u.role as user_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [id]);

    res.json({ 
      post: { ...post, comments }
    });
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva publicación (solo ONGs)
router.post('/posts', async (req, res) => {
  try {
    const { title, content, image, tags, ong_id } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-jwt');
    const db = await getDatabase();

    // Verificar que el usuario sea una ONG
    const user = await db.get('SELECT role FROM users WHERE id = ?', [decoded.userId]);
    if (user.role !== 'ong') {
      return res.status(403).json({ error: 'Solo las ONGs pueden crear publicaciones' });
    }

    const result = await db.run(`
      INSERT INTO forum_posts (user_id, ong_id, title, content, image, tags)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [decoded.userId, ong_id, title, content, image, tags]);

    const newPost = await db.get(`
      SELECT fp.*, u.name as author_name, u.role as author_role, o.name as ong_name
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN ongs o ON fp.ong_id = o.id
      WHERE fp.id = ?
    `, [result.lastID]);

    res.status(201).json({
      message: 'Publicación creada exitosamente',
      post: newPost
    });
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Comentar en publicación
router.post('/posts/:id/comments', async (req, res) => {
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

    const result = await db.run('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)', 
      [decoded.userId, id, content]);

    // Actualizar contador de comentarios
    await db.run('UPDATE forum_posts SET comments_count = comments_count + 1 WHERE id = ?', [id]);

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

// Dar like a publicación
router.post('/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    await db.run('UPDATE forum_posts SET likes = likes + 1 WHERE id = ?', [id]);

    res.json({
      message: 'Like agregado exitosamente'
    });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener etiquetas populares
router.get('/tags', async (req, res) => {
  try {
    const db = await getDatabase();

    const tags = await db.all(`
      SELECT tags, COUNT(*) as count
      FROM forum_posts
      WHERE tags IS NOT NULL AND tags != ''
      GROUP BY tags
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({ tags });
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 