const express = require('express');
const { getAllFilms, getFilmById, createFilm } = require('../controllers/filmController');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllFilms);
router.get('/:id', getFilmById);
router.post('/', auth, admin, createFilm);

module.exports = router;