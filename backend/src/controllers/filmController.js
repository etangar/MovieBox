const Joi = require('joi');
const db = require('../config/database');

const filmSchema = Joi.object({
  naslov: Joi.string().required(),
  opis: Joi.string(),
  zanr: Joi.string(),
  godina: Joi.number().integer().min(1900).max(new Date().getFullYear() + 5),
  type: Joi.string().valid('film', 'serija').required(),
  poster_url: Joi.string().uri(),
  trailer_url: Joi.string().uri(),
  imdb_rating: Joi.number().min(0).max(10),
  duration_minutes: Joi.number().integer().min(1)
});

const getAllFilms = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      zanr, 
      godina, 
      type,
      sort = 'naslov'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM film WHERE 1=1';
    const params = [];

    // Add filters
    if (search) {
      query += ' AND naslov LIKE ?';
      params.push(`%${search}%`);
    }
    
    if (zanr) {
      query += ' AND zanr LIKE ?';
      params.push(`%${zanr}%`);
    }
    
    if (godina) {
      query += ' AND godina = ?';
      params.push(godina);
    }
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    // Add sorting
    const validSortFields = ['naslov', 'godina', 'imdb_rating', 'created_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'naslov';
    query += ` ORDER BY ${sortField} DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    console.log('Query:', query);

    

    const [films] = await db.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM film WHERE 1=1';
    const countParams = []; // Remove limit and offset
    
if (search) {
  countQuery += ' AND naslov LIKE ?';
  countParams.push(`%${search}%`);
}

if (zanr) {
  countQuery += ' AND zanr LIKE ?';
  countParams.push(`%${zanr}%`);
}

if (godina) {
  countQuery += ' AND godina = ?';
  countParams.push(godina);
}

if (type) {
  countQuery += ' AND type = ?';
  countParams.push(type);
}
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      films,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get films error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFilmById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [films] = await db.execute(
      'SELECT * FROM film WHERE id = ?',
      [id]
    );

    if (films.length === 0) {
      return res.status(404).json({ message: 'Film not found' });
    }

    // Get average rating
    const [ratingResult] = await db.execute(
      'SELECT AVG(vrijednost) as avg_rating, COUNT(*) as total_ratings FROM ocjena WHERE film_id = ?',
      [id]
    );

  const film = {
  ...films[0],
  avg_rating: ratingResult[0].avg_rating ? parseFloat(ratingResult[0].avg_rating).toFixed(1) : null,
  total_ratings: ratingResult[0].total_ratings
};

    res.json({ film });
  } catch (error) {
    console.error('Get film error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createFilm = async (req, res) => {
  try {
    const { error } = filmSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { naslov, opis, zanr, godina, type, poster_url, trailer_url, imdb_rating, duration_minutes } = req.body;

    const [result] = await db.execute(
      'INSERT INTO film (naslov, opis, zanr, godina, type, poster_url, trailer_url, imdb_rating, duration_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [naslov, opis, zanr, godina, type, poster_url, trailer_url, imdb_rating, duration_minutes]
    );

    const [newFilm] = await db.execute(
      'SELECT * FROM film WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Film created successfully',
      film: newFilm[0]
    });
  } catch (error) {
    console.error('Create film error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllFilms, getFilmById, createFilm };