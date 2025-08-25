const express = require('express');
const { auth, admin } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// All routes require admin authentication
router.use(auth, admin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, email, first_name, last_name, role, created_at FROM korisnik WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (username LIKE ? OR email LIKE ? OR CONCAT(first_name, " ", last_name) LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await db.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM korisnik WHERE 1=1';
    const countParams = [];
    if (search) {
      countQuery += ' AND (username LIKE ? OR email LIKE ? OR CONCAT(first_name, " ", last_name) LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Can't delete admin users
    const [user] = await db.execute('SELECT role FROM korisnik WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user[0].role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    await db.execute('DELETE FROM korisnik WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;

    const [result] = await db.execute('DELETE FROM komentar WHERE id = ?', [commentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;