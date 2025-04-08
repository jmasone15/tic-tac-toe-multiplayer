// External Dependencies
import express from 'express';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';

// Node Packages
import { fileURLToPath } from 'url';
import http from 'http';
import path from 'path';

// Server setup
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Build path (no access to __dirname in ES6 module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(morgan('tiny'));

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
