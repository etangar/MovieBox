const express = require('express');
const { getAllFilms, getFilmById, createFilm } = require('../controllers/filmController');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllFilms);
router.get('/:id', getFilmById);
router.post('/', auth, admin, createFilm);

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM film WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Film not found' });
    }

    res.json({ message: 'Film deleted successfully' });
  } catch (error) {
    console.error('Delete film error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;