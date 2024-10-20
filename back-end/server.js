const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const authenticate = require('./middleware/authenticate')
const taskRoutes = require('./routes/task-routes');
const projectRoutes = require('./routes/project-routes')
const journalRoutes = require('./routes/journal-routes')
const calenderRoutes = require('./routes/calender-routes')
const tagRoutes = require('./routes/tag-routes')
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());



// Public API route
app.get('/api', (req, res) => {
    res.json({ message: 'Hello world!' });
});

// Test route protected by authentication middleware
app.get('/api/test', authenticate, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

app.use('/', taskRoutes); // Mount task routes here
app.use('/', projectRoutes);
app.use('/', journalRoutes);
app.use('/', calenderRoutes);
app.use('/', tagRoutes);

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

module.exports = app; 