const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../config/database');
const Joi = require('joi');

const router = express.Router();

const watchlistSchema = Joi.object({
  film_id: Joi.number().integer().required(),
  status: Joi.string().valid('gledano', 'planirano').required()
});

// Get user's watchlist
router.get('/watchlist', auth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT wl.*, f.naslov, f.zanr, f.godina, f.poster_url, f.type
      FROM watch_list wl
      JOIN film f ON wl.film_id = f.id
      WHERE wl.korisnik_id = ?
    `;
    const params = [req.user.id];

    if (status && ['gledano', 'planirano'].includes(status)) {
      query += ' AND wl.status = ?';
      params.push(status);
    }

    query += ' ORDER BY wl.added_date DESC';

    const [watchlist] = await db.execute(query, params);
    res.json({ watchlist });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to watchlist
router.post('/watchlist', auth, async (req, res) => {
  try {
    const { error } = watchlistSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { film_id, status } = req.body;
    const user_id = req.user.id;

    // Check if film exists
    const [films] = await db.execute('SELECT id FROM film WHERE id = ?', [film_id]);
    if (films.length === 0) {
      return res.status(404).json({ message: 'Film not found' });
    }

    // Check if already in watchlist
    const [existing] = await db.execute(
      'SELECT id, status FROM watch_list WHERE korisnik_id = ? AND film_id = ?',
      [user_id, film_id]
    );

    if (existing.length > 0) {
      // Update existing entry
      const watched_date = status === 'gledano' ? new Date() : null;
      await db.execute(
        'UPDATE watch_list SET status = ?, watched_date = ? WHERE korisnik_id = ? AND film_id = ?',
        [status, watched_date, user_id, film_id]
      );
      res.json({ message: 'Watchlist updated successfully' });
    } else {
      // Add new entry
      const watched_date = status === 'gledano' ? new Date() : null;
      await db.execute(
        'INSERT INTO watch_list (korisnik_id, film_id, status, watched_date) VALUES (?, ?, ?, ?)',
        [user_id, film_id, status, watched_date]
      );
      res.status(201).json({ message: 'Added to watchlist successfully' });
    }
  } catch (error) {
    console.error('Watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from watchlist
router.delete('/watchlist/:filmId', auth, async (req, res) => {
  try {
    const { filmId } = req.params;
    const user_id = req.user.id;

    const [result] = await db.execute(
      'DELETE FROM watch_list WHERE korisnik_id = ? AND film_id = ?',
      [user_id, filmId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found in watchlist' });
    }

    res.json({ message: 'Removed from watchlist successfully' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;