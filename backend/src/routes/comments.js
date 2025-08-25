const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../config/database');
const Joi = require('joi');

const router = express.Router();

const commentSchema = Joi.object({
  film_id: Joi.number().integer().required(),
  tekst: Joi.string().min(1).max(1000).required()
});

// Add comment
router.post('/', auth, async (req, res) => {
  try {
    const { error } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { film_id, tekst } = req.body;
    const user_id = req.user.id;

    // Check if film exists
    const [films] = await db.execute('SELECT id FROM film WHERE id = ?', [film_id]);
    if (films.length === 0) {
      return res.status(404).json({ message: 'Film not found' });
    }

    const [result] = await db.execute(
      'INSERT INTO komentar (korisnik_id, film_id, tekst) VALUES (?, ?, ?)',
      [user_id, film_id, tekst]
    );

    // Get the created comment with user info
    const [comment] = await db.execute(`
      SELECT k.*, u.username, u.first_name, u.last_name 
      FROM komentar k 
      JOIN korisnik u ON k.korisnik_id = u.id 
      WHERE k.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: comment[0]
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a film
router.get('/film/:filmId', async (req, res) => {
  try {
    const { filmId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const [comments] = await db.execute(`
      SELECT k.*, u.username, u.first_name, u.last_name 
      FROM komentar k 
      JOIN korisnik u ON k.korisnik_id = u.id 
      WHERE k.film_id = ?
      ORDER BY k.datum DESC
      LIMIT ? OFFSET ?
    `, [filmId, parseInt(limit), parseInt(offset)]);

    // Get total count
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM komentar WHERE film_id = ?',
      [filmId]
    );

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;