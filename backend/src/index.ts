import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';

import teamRoutes from './routes/teams';
import gameRoutes from './routes/game';
import mysteryRoutes from './routes/mystery';
import adminRoutes from './routes/admin';
import { registerSocketHandlers } from './sockets/gameSocket';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://nexus-among-us-dashboard.vercel.app',
];

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  return allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
};

// Setup Socket.IO with origin validation
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Socket connection rejected by CORS policy'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

import rateLimit from 'express-rate-limit';

// Global API Rate Limiter: Allows fast valid requests while blocking spam/flooding attacks (DoS)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 600, // Up to 600 requests per minute per IP (plenty for active multiplayer gameplay)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'High traffic detected. Please slow down and try again shortly.',
  },
});

// Strict Auth Limiter: Protects login against brute-force attacks and credential stuffing
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 40, // 40 attempts per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 60 seconds before trying again.',
  },
});

// Security Headers & Payload Hardening
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Restrict maximum request body size to prevent memory-exhaustion / OOM crash attacks
app.use(express.json({ limit: '100kb' }));

// Apply rate limiters
app.use('/api', apiLimiter);
app.use('/api/teams/login', authLimiter);
app.use('/api/admin', authLimiter);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    event: 'NEXUS Among Us: Coded Chaos & Tech Mystery',
    time: new Date().toISOString(),
  });
});

// Routes
app.use('/api/teams', teamRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/mystery', mysteryRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling
app.use(errorHandler);

// Sockets
registerSocketHandlers(io);

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 NEXUS Event Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready for live game syncing`);
});

export { app, server, io };
