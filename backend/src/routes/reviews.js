const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../config/database');
const Joi = require('joi');

const router = express.Router();

const reviewSchema = Joi.object({
  film_id: Joi.number().integer().required(),
  vrijednost: Joi.number().integer().min(1).max(5).required()
});

// Add or update review
router.post('/', auth, async (req, res) => {
  try {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { film_id, vrijednost } = req.body;
    const user_id = req.user.id;

    // Check if film exists
    const [films] = await db.execute('SELECT id FROM film WHERE id = ?', [film_id]);
    if (films.length === 0) {
      return res.status(404).json({ message: 'Film not found' });
    }

    // Check if user already reviewed this film
    const [existingReview] = await db.execute(
      'SELECT id FROM ocjena WHERE korisnik_id = ? AND film_id = ?',
      [user_id, film_id]
    );

    if (existingReview.length > 0) {
      
      await db.execute(
        'UPDATE ocjena SET vrijednost = ?, datum = CURRENT_TIMESTAMP WHERE korisnik_id = ? AND film_id = ?',
        [vrijednost, user_id, film_id]
      );
      res.json({ message: 'Review updated successfully' });
    } else {
      
      await db.execute(
        'INSERT INTO ocjena (korisnik_id, film_id, vrijednost) VALUES (?, ?, ?)',
        [user_id, film_id, vrijednost]
      );
      res.status(201).json({ message: 'Review added successfully' });
    }
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for a film
router.get('/film/:filmId', async (req, res) => {
  try {
    const { filmId } = req.params;
    
    const [reviews] = await db.execute(`
      SELECT o.*, k.username, k.first_name, k.last_name 
      FROM ocjena o 
      JOIN korisnik k ON o.korisnik_id = k.id 
      WHERE o.film_id = ? 
      ORDER BY o.datum DESC
    `, [filmId]);

    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;