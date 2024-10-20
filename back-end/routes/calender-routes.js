const express = require('express');
const router = express.Router();
const pool = require('../db/dbConfig');
const authenticate = require('../middleware/authenticate');


// Create a new calendar event
router.post('/calendar', authenticate, async (req, res) => {
    try {
      const { title, start_time, end_time, is_all_day } = req.body;
      const user_id = req.user.uid;
  
      // Create the calendar event without task association
      const result = await pool.query(
        `INSERT INTO calendar_tasks (user_id, title, start_time, end_time, is_all_day) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [user_id, title, start_time, end_time, is_all_day]
      );
  
      res.status(201).json(result.rows[0]); // Send back the created calendar event
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  

  // Get all calendar events for the logged-in user
router.get('/calendar', authenticate, async (req, res) => {
    try {
      const user_id = req.user.uid;
  
      const result = await pool.query(
        `SELECT * FROM calendar_tasks WHERE user_id = $1 ORDER BY start_time`,
        [user_id]
      );
  
      res.status(200).json(result.rows); // Send back the user's calendar events
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  

  // Get a specific calendar event by ID
router.get('/calendar/:eventId', authenticate, async (req, res) => {
    try {
      const { eventId } = req.params;
      const user_id = req.user.uid;
  
      const result = await pool.query(
        `SELECT * FROM calendar_tasks WHERE id = $1 AND user_id = $2`,
        [eventId, user_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).send('Calendar event not found or does not belong to you');
      }
  
      res.status(200).json(result.rows[0]); // Send back the specific calendar event
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  

  // Edit a calendar event by ID
router.put('/calendar/:eventId', authenticate, async (req, res) => {
    try {
      const { eventId } = req.params;
      const { title, start_time, end_time, is_all_day } = req.body;
      const user_id = req.user.uid;
  
      const result = await pool.query(
        `UPDATE calendar_tasks 
         SET title = $1, start_time = $2, end_time = $3, is_all_day = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $5 AND user_id = $6 RETURNING *`,
        [title, start_time, end_time, is_all_day, eventId, user_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).send('Calendar event not found or does not belong to you');
      }
  
      res.status(200).json(result.rows[0]); // Send back the updated calendar event
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
 
  
  // Delete a calendar event by ID
router.delete('/calendar/:eventId', authenticate, async (req, res) => {
    try {
      const { eventId } = req.params;
      const user_id = req.user.uid;
  
      const result = await pool.query(
        `DELETE FROM calendar_tasks WHERE id = $1 AND user_id = $2 RETURNING *`,
        [eventId, user_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).send('Calendar event not found or does not belong to you');
      }
  
      res.status(200).json({ message: 'Calendar event deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
  module.exports = router;