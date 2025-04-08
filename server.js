// External Dependencies
import express from 'express';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';

// Internal Dependencies
import __dirname from './utils/getDirname.js';
import { router as htmlRoutes } from './routes/staticRoutes.js';

// Node Packages
import http from 'http';
import path from 'path';

// Server setup
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(morgan('tiny'));
app.use('/', htmlRoutes);

// 404 Route
app.use((_, res) => {
	res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// WebSocket instance
wss.on('connection', (socket) => {
	console.log('✅ New WebSocket connection');

	socket.on('close', () => {
		console.log('❌ WebSocket client disconnected');
	});
});

// Start server
server.listen(PORT, () => {
	console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
