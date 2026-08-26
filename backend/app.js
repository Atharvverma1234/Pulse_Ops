// backend/app.js
// Separated from server.js so tests can import without starting listener
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const dotenv   = require('dotenv');
const http     = require('http');
const { Server } = require('socket.io');

const authRoutes     = require('./routes/authRoutes');
const userRoutes     = require('./routes/userRoutes');
const metricsRoutes  = require('./routes/metricsRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const alertRoutes    = require('./routes/alertRoutes');
const aiRoutes       = require('./routes/aiRoutes');
const rcaRoutes      = require('./routes/rcaRoutes');
const webhookRoutes  = require('./routes/webhookRoutes');

const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());
app.use(helmet());
app.set('io', io);

app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'PulseOps Backend' })
);

app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/metrics',   metricsRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts',    alertRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/rca',       rcaRoutes);
app.use('/api/webhooks',  webhookRoutes);

module.exports = { app, server, io };