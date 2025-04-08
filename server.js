// External Dependencies
import express from 'express';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';

// Internal Dependencies
import __dirname from './utils/getDirname.js';
import TicTacToeSocket from './utils/Classes.js';
import { router as htmlRoutes } from './routes/staticRoutes.js';

// Node Packages
import http from 'http';
import path from 'path';

// Server setup
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);

// Create WebSocket Instance
new TicTacToeSocket(server);

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(morgan('tiny'));
app.use('/', htmlRoutes);

// 404 Route
app.use((_, res) => {
	res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start server
server.listen(PORT, () => {
	console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
