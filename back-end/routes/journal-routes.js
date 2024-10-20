const express = require('express');
const router = express.Router();
const pool = require('../db/dbConfig');
const authenticate = require('../middleware/authenticate');

// Route to create a new journal entry
router.post('/journals', authenticate, async (req, res) => {
  try {
    const { task_id = null, entry } = req.body;
    const user_id = req.user.uid;

    if (entry.length > 1000) {
      return res.status(400).send('Entry exceeds maximum length of 1000 characters');
    }

    const result = await pool.query(
      `INSERT INTO journal_entries (user_id, task_id, entry)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, task_id, entry]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to get all journal entries for the authenticated user
router.get('/journals', authenticate, async (req, res) => {
  try {
    const user_id = req.user.uid;

    const result = await pool.query(
      `SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('No journal entries found');
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to get a specific journal entry by id
router.get('/journals/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid;

    const result = await pool.query(
      `SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Journal entry not found');
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to edit a journal entry
router.put('/journals/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid;
    const { entry } = req.body;

    if (entry.length > 1000) {
      return res.status(400).send('Entry exceeds maximum length of 1000 characters');
    }

    const result = await pool.query(
      `UPDATE journal_entries
       SET entry = $1, created_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [entry, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Journal entry not found or does not belong to you');
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to delete a journal entry
router.delete('/journals/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid;

    const result = await pool.query(
      `DELETE FROM journal_entries WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Journal entry not found or does not belong to you');
    }

    res.status(200).json({ message: 'Journal entry deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
