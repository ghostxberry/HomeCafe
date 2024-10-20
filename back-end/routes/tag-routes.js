const express = require('express');
const router = express.Router();
const pool = require('../db/dbConfig');
const authenticate = require('../middleware/authenticate');

// Create tag
router.post('/tags', authenticate, async (req, res) => {
    try {
        const { name } = req.body;
        const user_id = req.user.uid;

        // Check if the tag already exists for the user
        const existingTag = await pool.query(
            `SELECT * FROM tags WHERE user_id = $1 AND name = $2`,
            [user_id, name]
        );

        if (existingTag.rows.length > 0) {
            return res.status(400).json({ message: 'Tag already exists' });
        }

        const result = await pool.query(
            `INSERT INTO tags (user_id, name) 
            VALUES ($1, $2) RETURNING *`,
            [user_id, name]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating tag:', err.message);
        res.status(500).send('Server error');
    }
});


// Get all tags
router.get('/tags', authenticate, async (req, res) => {
    try {
        const user_id = req.user.uid;

        const result = await pool.query(
            `SELECT * FROM tags WHERE user_id = $1`,
            [user_id]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching tags:', err.message);
        res.status(500).send('Server error');
    }
});

// Update tag
router.put('/tags/:tagId', authenticate, async (req, res) => {
    try {
        const { tagId } = req.params;
        const { name } = req.body;
        const user_id = req.user.uid;

        const result = await pool.query(
            `UPDATE tags 
            SET name = $1 
            WHERE id = $2 AND user_id = $3 RETURNING *`,
            [name, tagId, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Tag not found or does not belong to you');
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating tag:', err.message);
        res.status(500).send('Server error');
    }
});

// Delete tag
router.delete('/tags/:tagId', authenticate, async (req, res) => {
    try {
        const { tagId } = req.params;
        const user_id = req.user.uid;

        const result = await pool.query(
            `DELETE FROM tags WHERE id = $1 AND user_id = $2 RETURNING *`,
            [tagId, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Tag not found or does not belong to you');
        }

        res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (err) {
        console.error('Error deleting tag:', err.message);
        res.status(500).send('Server error');
    }
});

// Attach a tag to a task
router.post('/tasks/:taskId/tags', authenticate, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { tag_id } = req.body;
        const user_id = req.user.uid;

        // Check if the tag is already associated with the task
        const existingAssociation = await pool.query(
            `SELECT * FROM task_tags WHERE task_id = $1 AND tag_id = $2`,
            [taskId, tag_id]
        );

        if (existingAssociation.rows.length > 0) {
            return res.status(400).json({ message: 'Tag is already associated with this task' });
        }

        const result = await pool.query(
            `INSERT INTO task_tags (task_id, tag_id) 
            VALUES ($1, $2) RETURNING *`,
            [taskId, tag_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error attaching tag to task:', err.message);
        res.status(500).send('Server error');
    }
});

// Get tags by task
router.get('/tasks/:taskId/tags', authenticate, async (req, res) => {
    try {
        const { taskId } = req.params;
        const user_id = req.user.uid;

        const result = await pool.query(
            `SELECT tg.* FROM tags tg
             JOIN task_tags tt ON tg.id = tt.tag_id
             WHERE tt.task_id = $1 AND tg.user_id = $2`,
            [taskId, user_id]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching tags by task:', err.message);
        res.status(500).send('Server error');
    }
});

// Remove a tag from a task
router.delete('/tasks/:taskId/tags/:tagId', authenticate, async (req, res) => {
    try {
        const { taskId, tagId } = req.params;

        const result = await pool.query(
            `DELETE FROM task_tags WHERE task_id = $1 AND tag_id = $2 RETURNING *`,
            [taskId, tagId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Tag not found for this task');
        }

        res.status(200).json({ message: 'Tag removed from task successfully' });
    } catch (err) {
        console.error('Error removing tag from task:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
