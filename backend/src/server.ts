// External Dependencies
import express from 'express';
import { WebSocketServer } from 'ws';

// Node Packages
import http from 'http';
import path from 'path';

// Create Express and WebSocket instances
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static Svelte build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// WebSocket connection handler
wss.on('connection', (ws) => {
	console.log('✅ New WebSocket connection');

	// Handle Events
	ws.on('message', (message) => {
		console.log('Received: ', message.toString());

		// Broadcast to all connected clients
		wss.clients.forEach((client) => {
			if (client !== ws && client.readyState === ws.OPEN) {
				client.send(message.toString());
			}
		});
	});

	ws.on('close', () => {
		console.log('❌ WebSocket client disconnected');
	});
});

// Start Server
server.listen(PORT, () => {
	console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
