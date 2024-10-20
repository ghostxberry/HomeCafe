const express = require('express');
const router = express.Router();
const pool = require('../db/dbConfig'); 

// Middleware to verify Firebase token (use your existing authentication middleware)
const authenticate = require('../middleware/authenticate');

router.post('/tasks', authenticate, async (req, res) => {
  try {
    const { title, priority = null } = req.body;
    const user_id = req.user.uid;
    const start_time = new Date();

    // Check if the user already has an active task
    const activeTaskResult = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 AND is_active = true`,
      [user_id]
    );

    if (activeTaskResult.rows.length > 0) {
      return res.status(400).json({ message: 'You already have an active task. Please stop it before starting a new one.' });
    }

    // Insert the new task into the database
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, priority, start_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, title, priority, start_time]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/tasks/active', authenticate, async (req, res) => {
  try {
    const user_id = req.user.uid;

    const activeTaskResult = await pool.query(`
      SELECT t.*, p.id AS project_id, p.name AS project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = $1 AND t.is_active = true
    `, [user_id]);

    if (activeTaskResult.rows.length === 0) {
      return res.status(200).json({ message: 'No active task found.' });
    }

    const task = activeTaskResult.rows[0];
    const elapsedTimeInSeconds = Math.floor((new Date() - new Date(task.start_time)) / 1000);

    res.status(200).json({
      ...task,
      elapsedTime: elapsedTimeInSeconds, // Add the calculated elapsed time
      project_id: task.project_id, // Include project ID
      project_name: task.project_name // Include project name
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});




// Route to stop a task (WORKS)
router.put('/tasks/:id/stop', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid; // Assuming req.user is set after verifying the token
    const end_time = new Date(); // Set the end time to the current time

    // Find the task and verify it belongs to the current user
    const taskResult = await pool.query(
      `SELECT * FROM tasks WHERE id = $1 AND user_id = $2 AND is_active = true`,
      [id, user_id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).send('Task not found or already stopped');
    }

    const task = taskResult.rows[0];
    const totalSeconds = Math.floor((end_time - new Date(task.start_time)) / 1000); // Calculate total time in seconds
    
    // Convert seconds to hours and minutes
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    // Update the task with end_time, total_time, and set is_active to false
    const updatedTaskResult = await pool.query(
      `UPDATE tasks
       SET end_time = $1, total_time = $2, is_active = false
       WHERE id = $3
       RETURNING *`,
      [end_time, totalSeconds, id] // Store total time in seconds for calculations
    );

    const formattedTotalTime = `${hours}h ${minutes}m`;

    res.status(200).json({
      ...updatedTaskResult.rows[0],
      total_time: formattedTotalTime // Send the formatted string back in the response
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.get('/tasks', authenticate, async (req, res) => {
  try {
    const user_id = req.user.uid;
    const { tagName } = req.query; // Get tagName from query parameters

    let query = `
      SELECT t.*, ARRAY_AGG(tg.name) AS tags
      FROM tasks t
      LEFT JOIN task_tags tt ON t.id = tt.task_id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
      WHERE t.user_id = $1 AND t.is_active = false
      GROUP BY t.id
    `;
    const values = [user_id];

    // If tagName is provided, filter tasks by tag name
    if (tagName) {
      query += ` AND tg.name = $2`;
      values.push(tagName);
    }

    const taskResult = await pool.query(query, values);

    if (taskResult.rows.length === 0) {
      return res.status(200).json({ message: 'No completed tasks found for the current user' });
    }

    res.status(200).json(taskResult.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).send('Server error');
  }
});





  // Route to retrieve a specific task (WORKS)
router.get('/tasks/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid; // Assuming req.user is set after verifying the token

    // Find the task and verify it belongs to the current user
    const taskResult = await pool.query(
      `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).send('Task not found');
    }

    res.status(200).json(taskResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route to delete a task (WORKS)
router.delete('/tasks/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid; // Assuming req.user is set after verifying the token

    // Check if the task exists and belongs to the current user
    const taskResult = await pool.query(
      `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).send('Task not found or does not belong to you');
    }

    // Delete the task
    await pool.query(
      `DELETE FROM tasks WHERE id = $1`,
      [id]
    );

    res.status(200).json({ message: 'Task deleted successfully'}); // No content to send back
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


//Project task routes

// Route to associate a task with a project (WORKS)
router.put('/tasks/:taskId/project/:projectId', authenticate, async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    const user_id = req.user.uid;

    // Check if the task exists and belongs to the current user
    const taskResult = await pool.query(
      `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
      [taskId, user_id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).send('Task not found or does not belong to you');
    }

    // Check if the project exists and belongs to the current user
    const projectResult = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, user_id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).send('Project not found or does not belong to you');
    }

    // Update the task to associate it with the project
    await pool.query(
      `UPDATE tasks SET project_id = $1 WHERE id = $2`,
      [projectId, taskId]
    );

    res.status(200).json({ message: 'Task added to project' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Route to update the project association of a task (WORKS)
router.put('/tasks/:taskId/project', authenticate, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { action } = req.query;
    const user_id = req.user.uid;

    if (action !== 'remove') {
      return res.status(400).send('Invalid action');
    }

    // Check if the task exists and belongs to the current user
    const taskResult = await pool.query(
      `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
      [taskId, user_id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).send('Task not found or does not belong to you');
    }

    // Update the task to remove the project association
    await pool.query(
      `UPDATE tasks SET project_id = NULL WHERE id = $1`,
      [taskId]
    );

    res.status(200).json({ message: 'Task removed from project' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});





module.exports = router;
