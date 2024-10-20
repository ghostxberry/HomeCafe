const express = require('express');
const router = express.Router();
const pool = require('../db/dbConfig'); 

// Middleware to verify Firebase token
const authenticate = require('../middleware/authenticate');

// Route to create a new project
router.post('/projects', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    const user_id = req.user.uid; 

    // Insert the new project into the database
    const result = await pool.query(
      `INSERT INTO projects (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to get all projects for the current user
router.get('/projects', authenticate, async (req, res) => {
  try {
    const user_id = req.user.uid; 

    const result = await pool.query(
      `SELECT * FROM projects WHERE user_id = $1`,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to get a specific project by ID
router.get('/projects/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid; 

    const result = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Project not found or does not belong to you');
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to update a project
router.put('/projects/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid; 
    const { name, description } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name, description, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Project not found or does not belong to you');
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to delete a project
router.delete('/projects/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid;

    // Check if the project exists and belongs to the current user
    const projectResult = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).send('Project not found or does not belong to you');
    }

    // Delete the project
    await pool.query(
      `DELETE FROM projects WHERE id = $1`,
      [id]
    );

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to get all tasks for a specific project
router.get('/projects/:projectId/tasks', authenticate, async (req, res) => {
    try {
      const { projectId } = req.params;
      const user_id = req.user.uid;
  
      // Check if the project exists and belongs to the current user
      const projectResult = await pool.query(
        `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
        [projectId, user_id]
      );
  
      if (projectResult.rows.length === 0) {
        return res.status(404).send('Project not found or does not belong to you');
      }
  
      // Retrieve tasks associated with the project
      const tasksResult = await pool.query(
        `SELECT * FROM tasks WHERE project_id = $1 AND user_id = $2`,
        [projectId, user_id]
      );
  
      res.status(200).json(tasksResult.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  

module.exports = router;
