// Dice Temple Backend Server
// Express + Socket.IO server for real-time D&D dice rolling

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  addUser,
  removeUser,
  getUser,
  getUsers,
  setDMHideRolls,
  isDMHidingRolls,
  updateUserHealth
} from './roomManager.js';

import {
  addRoll,
  getHistory,
  getHistoryForRole,
  generateRoll
} from './rollHistory.js';

// ES Module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port configuration (must be before other code that references it)
const PORT = process.env.PORT || 3000;

// Initialize Express app
const app = express();
const server = createServer(app);

// CORS middleware for HTTP requests (needed for Socket.IO polling)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Socket.IO with CORS and transport support
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['polling', 'websocket'],
  allowUpgrades: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Health check endpoint for Railway/monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// Debug endpoint to verify server configuration
app.get('/debug', (req, res) => {
  res.json({
    status: 'ok',
    socketIO: 'attached',
    transports: ['polling', 'websocket'],
    port: PORT,
    env: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from ../dist directory
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing (exclude socket.io and API paths)
app.get('*', (req, res, next) => {
  // Don't intercept socket.io requests
  if (req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Send current roll history on connection
  // Note: Full history sent, client will filter based on their role after joining
  socket.emit('history-sync', getHistory());

  // Handle user joining
  socket.on('join', ({ name, role, secret, maxHealth, currentHealth }) => {
    // Validate DM secret if joining as DM
    if (role === 'dm') {
      const dmSecret = process.env.DM_SECRET;
      if (!dmSecret || secret !== dmSecret) {
        socket.emit('join-error', { message: 'Invalid DM secret.' });
        return;
      }
    }

    // Attempt to add user (with health for players)
    const result = addUser(socket.id, { name, role, maxHealth, currentHealth });

    if (result.error) {
      socket.emit('join-error', { message: result.error });
      return;
    }

    // Successfully joined
    socket.emit('join-success', {
      user: result,
      users: getUsers(),
      history: getHistory(),
      hideRolls: isDMHidingRolls()
    });

    // Broadcast to all other users
    socket.broadcast.emit('user-joined', {
      user: result,
      users: getUsers()
    });

    console.log(`User joined: ${name} (${role})`);
  });

  // Handle dice roll
  socket.on('roll', ({ dieType }) => {
    const user = getUser(socket.id);

    if (!user) {
      socket.emit('roll-error', { message: 'You must join the room first.' });
      return;
    }

    // Generate roll result
    const result = generateRoll(dieType);

    if (result === null) {
      socket.emit('roll-error', { message: 'Invalid die type.' });
      return;
    }

    // Determine if roll should be hidden (DM roll with hideRolls enabled)
    const isHiddenRoll = user.role === 'dm' && isDMHidingRolls();

    // Create roll record
    const roll = addRoll({
      userName: user.name,
      role: user.role,
      dieType,
      result,
      hidden: isHiddenRoll,
      timestamp: Date.now()
    });

    // Send full result to the roller (DM sees their own hidden rolls)
    socket.emit('roll-result', roll);

    // Broadcast to others
    if (isHiddenRoll) {
      // Non-DM users see hidden roll with null result
      socket.broadcast.emit('roll-result', {
        ...roll,
        result: null
      });
    } else {
      // Everyone sees the full result
      socket.broadcast.emit('roll-result', roll);
    }

    console.log(`Roll: ${user.name} rolled ${dieType} = ${result}${isHiddenRoll ? ' (hidden)' : ''}`);
  });

  // Handle DM toggle hide rolls
  socket.on('toggle-hide-rolls', () => {
    const user = getUser(socket.id);

    if (!user || user.role !== 'dm') {
      socket.emit('toggle-error', { message: 'Only the DM can toggle hide rolls.' });
      return;
    }

    // Toggle the hide rolls state
    const newState = !isDMHidingRolls();
    setDMHideRolls(newState);

    // Broadcast the new state to all users
    io.emit('hide-rolls-changed', { hideRolls: newState });

    console.log(`DM ${newState ? 'enabled' : 'disabled'} hidden rolls`);
  });

  // Handle health update
  socket.on('update-health', ({ newHealth }) => {
    const user = getUser(socket.id);

    if (!user || user.role !== 'player') {
      socket.emit('health-error', { message: 'Only players can update health.' });
      return;
    }

    const updatedUser = updateUserHealth(socket.id, newHealth);

    if (updatedUser) {
      // Broadcast updated user list to all users
      io.emit('health-updated', {
        userId: socket.id,
        currentHealth: updatedUser.currentHealth,
        users: getUsers()
      });

      console.log(`Health update: ${user.name} now has ${updatedUser.currentHealth}/${updatedUser.maxHealth} HP`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      // Broadcast user left to all remaining users
      io.emit('user-left', {
        user,
        users: getUsers()
      });

      console.log(`User left: ${user.name}`);
    }

    console.log(`Disconnected: ${socket.id}`);
  });
});

// Start server (bind to 0.0.0.0 for cloud platforms like Railway)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Dice Temple server running on port ${PORT}`);
  console.log(`Serving static files from: ${distPath}`);
});
