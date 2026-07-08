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
const incidentRoutes = require('./routes/incidentRoutes');
const { setIO: setAlertIO } = require('./services/alertEngine');
const alertRoutes = require('./routes/alertRoutes');
const { setIO: setAnomalyIO } = require('./services/anomalyProcessor');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use('/api', apiLimiter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

// ── Routes ────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'PulseOps Backend' })
);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ai', aiRoutes);

// ── Socket.IO ─────────────────────────────────
io.on('connection', (socket) => {
  console.log('Dashboard connected:', socket.id);

  // Send latest metrics immediately when client connects
  const Metric = require('./models/Metric');
  Metric.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$host', latestMetric: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$latestMetric' } },
  ])
    .then((latest) => socket.emit('metrics:initial', latest))
    .catch((err) => console.error('Initial metrics error:', err));

  socket.on('disconnect', () =>
    console.log('Dashboard disconnected:', socket.id)
  );
});

// ── MongoDB + startup ─────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    setAlertIO(io);  
    setAnomalyIO(io);
    await startMetricsFlushWorker(io); // pass io here
  })
  .catch((err) => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);

module.exports = { app, io };