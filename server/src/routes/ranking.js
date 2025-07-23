import express from 'express';
import { getDatabase } from '../database/init.js';

const router = express.Router();

// Obtener ranking de ONGs
router.get('/', async (req, res) => {
  try {
    const { sort = 'impact', limit = 10 } = req.query;
    const db = await getDatabase();

    let orderBy;
    switch (sort) {
      case 'rating':
        orderBy = 'o.rating DESC, o.rating_count DESC';
        break;
      case 'projects':
        orderBy = 'o.projects_count DESC';
        break;
      case 'volunteers':
        orderBy = 'o.volunteers_count DESC';
        break;
      case 'donations':
        orderBy = 'o.donations_received DESC';
        break;
      case 'impact':
      default:
        orderBy = 'o.impact_score DESC';
        break;
    }

    const ongs = await db.all(`
      SELECT o.*, 
             COUNT(DISTINCT d.id) as total_donations,
             COUNT(DISTINCT v.id) as total_volunteers,
             AVG(r.rating) as average_rating,
             COUNT(r.id) as rating_count
      FROM ongs o
      LEFT JOIN donations d ON o.id = d.ong_id
      LEFT JOIN volunteering v ON o.id = v.ong_id
      LEFT JOIN ong_ratings r ON o.id = r.ong_id
      GROUP BY o.id
      ORDER BY ${orderBy}
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ 
      ranking: ongs,
      sortBy: sort,
      total: ongs.length
    });
  } catch (error) {
    console.error('Error al obtener ranking:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas del ranking
router.get('/stats', async (req, res) => {
  try {
    const db = await getDatabase();

    // Estadísticas generales
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_ongs,
        AVG(impact_score) as avg_impact,
        AVG(rating) as avg_rating,
        SUM(projects_count) as total_projects,
        SUM(volunteers_count) as total_volunteers,
        SUM(donations_received) as total_donations
      FROM ongs
    `);

    // Top 5 por categoría
    const topByImpact = await db.all(`
      SELECT name, impact_score
      FROM ongs
      ORDER BY impact_score DESC
      LIMIT 5
    `);

    const topByRating = await db.all(`
      SELECT name, rating, rating_count
      FROM ongs
      WHERE rating_count > 0
      ORDER BY rating DESC, rating_count DESC
      LIMIT 5
    `);

    const topByProjects = await db.all(`
      SELECT name, projects_count
      FROM ongs
      ORDER BY projects_count DESC
      LIMIT 5
    `);

    const topByVolunteers = await db.all(`
      SELECT name, volunteers_count
      FROM ongs
      ORDER BY volunteers_count DESC
      LIMIT 5
    `);

    res.json({
      stats,
      topByImpact,
      topByRating,
      topByProjects,
      topByVolunteers
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener ranking por ubicación
router.get('/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { sort = 'impact' } = req.query;
    const db = await getDatabase();

    let orderBy;
    switch (sort) {
      case 'rating':
        orderBy = 'o.rating DESC, o.rating_count DESC';
        break;
      case 'projects':
        orderBy = 'o.projects_count DESC';
        break;
      case 'volunteers':
        orderBy = 'o.volunteers_count DESC';
        break;
      case 'donations':
        orderBy = 'o.donations_received DESC';
        break;
      case 'impact':
      default:
        orderBy = 'o.impact_score DESC';
        break;
    }

    const ongs = await db.all(`
      SELECT o.*, 
             COUNT(DISTINCT d.id) as total_donations,
             COUNT(DISTINCT v.id) as total_volunteers,
             AVG(r.rating) as average_rating,
             COUNT(r.id) as rating_count
      FROM ongs o
      LEFT JOIN donations d ON o.id = d.ong_id
      LEFT JOIN volunteering v ON o.id = v.ong_id
      LEFT JOIN ong_ratings r ON o.id = r.ong_id
      WHERE o.location LIKE ?
      GROUP BY o.id
      ORDER BY ${orderBy}
    `, [`%${location}%`]);

    res.json({ 
      ranking: ongs,
      location,
      sortBy: sort,
      total: ongs.length
    });
  } catch (error) {
    console.error('Error al obtener ranking por ubicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener ranking por tipo de ONG
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { sort = 'impact' } = req.query;
    const db = await getDatabase();

    let orderBy;
    switch (sort) {
      case 'rating':
        orderBy = 'o.rating DESC, o.rating_count DESC';
        break;
      case 'projects':
        orderBy = 'o.projects_count DESC';
        break;
      case 'volunteers':
        orderBy = 'o.volunteers_count DESC';
        break;
      case 'donations':
        orderBy = 'o.donations_received DESC';
        break;
      case 'impact':
      default:
        orderBy = 'o.impact_score DESC';
        break;
    }

    const ongs = await db.all(`
      SELECT o.*, 
             COUNT(DISTINCT d.id) as total_donations,
             COUNT(DISTINCT v.id) as total_volunteers,
             AVG(r.rating) as average_rating,
             COUNT(r.id) as rating_count
      FROM ongs o
      LEFT JOIN donations d ON o.id = d.ong_id
      LEFT JOIN volunteering v ON o.id = v.ong_id
      LEFT JOIN ong_ratings r ON o.id = r.ong_id
      WHERE o.type = ?
      GROUP BY o.id
      ORDER BY ${orderBy}
    `, [type]);

    res.json({ 
      ranking: ongs,
      type,
      sortBy: sort,
      total: ongs.length
    });
  } catch (error) {
    console.error('Error al obtener ranking por tipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 