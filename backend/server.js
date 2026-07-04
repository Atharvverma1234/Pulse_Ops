// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { startMetricsFlushWorker } = require('./services/metricsQueue');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use('/api', apiLimiter);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Make io accessible in controllers later (Week 4)
app.set('io', io);

// ── Routes ────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'PulseOps Backend' })
);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/metrics', metricsRoutes);

// ── Socket.IO ─────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () =>
    console.log('Client disconnected:', socket.id)
  );
});

// ── MongoDB + startup ─────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    // Start background worker after DB is ready
    await startMetricsFlushWorker();
  })
  .catch((err) => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);

module.exports = { app, io };