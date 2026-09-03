const express = require('express');
const cors = require('cors');

// Initialize database (runs schema on import)
require('./db');

const authRoutes = require('./routes/auth');
const pointsRoutes = require('./routes/points');
const progressRoutes = require('./routes/progress');
const contentRoutes = require('./routes/content');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/content', contentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Zabandaan server running on http://localhost:${PORT}`);
});
