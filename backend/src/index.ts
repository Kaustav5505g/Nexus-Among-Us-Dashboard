import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

import teamRoutes from './routes/teams';
import gameRoutes from './routes/game';
import mysteryRoutes from './routes/mystery';
import adminRoutes from './routes/admin';
import { registerSocketHandlers } from './sockets/gameSocket';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

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
