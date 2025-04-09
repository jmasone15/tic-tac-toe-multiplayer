import { WebSocketServer } from 'ws';

class Player {
	constructor(socket, name, symbol) {
		this.socket = socket;
		this.name = name;
		this.symbol = symbol;
	}

	get ready() {
		return this.socket && this.socket.readyState === this.socket.OPEN;
	}
}

class Room {
	constructor(roomCode) {
		this.roomCode = roomCode;
		this.players = [];
	}

	get playersCount() {
		return this.players.length;
	}

	messageAll(type, payload, exludeSocket = null) {
		this.players.forEach((p) => {
			const isIncluded = !exludeSocket || p.socket !== exludeSocket;
			if (p.ready && isIncluded) {
				p.socket.send(
					JSON.stringify({
						type,
						payload
					})
				);
			}
		});
	}

	roomLog(message) {
		console.log(`Room ${this.roomCode}: ${message}`);
	}

	joinRoom(socket, name) {
		// Set symbol and create new player
		const symbol = this.playersCount === 0 ? 'X' : 'O';
		const player = new Player(socket, name, symbol);

		// Add to players array
		this.players.push(player);

		// Set socket with room code
		socket.roomCode = this.roomCode;

		// Log action and notify other players
		const message = `Player ${name} has joined the room as "${symbol}"`;
		this.roomLog(message);
		if (this.playersCount > 1) {
			this.messageAll('notification', { message }, socket);
		}
	}

	leaveRoom(socket) {
		const playerIdx = this.players.findIndex((p) => p.socket === socket);
		const message = `Player ${this.players[playerIdx].name} has left the room.`;

		this.roomLog(message);
		if (this.playersCount === 2) {
			this.messageAll('notification', { message }, socket);
		}

		// Remove player from room
		this.players.splice(playerIdx, 1);
	}
}

class Rooms {
	constructor() {
		this.rooms = new Map();
	}

	generateRoomCode() {
		// e.g. 'A1B2C'
		return Math.random().toString(36).substring(2, 7).toUpperCase();
	}

	createRoom() {
		let roomCode;

		while (true) {
			roomCode = this.generateRoomCode();

			// If roomCode is unique...
			if (!this.rooms.has(roomCode)) {
				// Create room and app to rooms map
				const room = new Room(roomCode);
				this.rooms.set(roomCode, room);

				console.log(`Room ${roomCode} has been created.`);

				return room;
			}
		}
	}

	findRoom(roomCode) {
		return this.rooms.get(roomCode);
	}

	deleteRoom(roomCode) {
		console.log(`Room ${roomCode} has been deleted`);
		this.rooms.delete(roomCode);
	}
}

class RateLimiter {
	constructor({ windowMs, maxRequests }) {
		this.windowMs = windowMs; // e.g., 10000 for 10 seconds
		this.maxRequests = maxRequests; // e.g., 20 messages per window
		this.map = new Map(); // key -> { count, lastReset }

		// Clean up old entries periodically
		setInterval(() => this.cleanup(), windowMs * 5);
	}

	isAllowed(key) {
		const now = Date.now();
		const data = this.map.get(key);

		if (!data) {
			this.map.set(key, { count: 1, lastReset: now });
			return true;
		}

		if (now - data.lastReset > this.windowMs) {
			data.count = 1;
			data.lastReset = now;
			this.map.set(key, data);
			return true;
		}

		if (data.count >= this.maxRequests) {
			return false;
		}

		data.count++;
		this.map.set(key, data);
		return true;
	}

	cleanup() {
		const now = Date.now();
		for (const [key, data] of this.map.entries()) {
			if (now - data.lastReset > this.windowMs * 5) {
				this.map.delete(key);
			}
		}
	}
}

export default class TicTacToeSocket {
	constructor(server) {
		// Create WebSocket server off of HTTP server
		this.wss = new WebSocketServer({ server });
		this.rooms = new Rooms();
		this.rateLimiter = new RateLimiter({
			windowMs: 10_000,
			maxRequests: 20
		});

		// Wire up connection to methods
		this.wss.on('connection', this.onConnection);
	}

	onConnection = (socket) => {
		console.log('✅ New WebSocket connection');

		// Socket Handlers
		socket.on('message', (message) => this.onMessage(socket, message));
		socket.on('close', () => this.onClose(socket));
	};

	onMessage = (socket, message) => {
		const ip = socket._socket.remoteAddress;
		if (!this.rateLimiter.isAllowed(ip)) {
			console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`);
			this.onError(socket, 'Rate of requests exceeded threshold');
			return;
		}

		const { type, roomCode, payload } = JSON.parse(message);

		switch (type) {
			case 'create-room':
				const newRoom = this.rooms.createRoom();
				newRoom.joinRoom(socket, payload.name);

				return;
			case 'join-room':
				const existingRoom = this.rooms.findRoom(roomCode);

				// No room found validation
				if (!existingRoom) {
					this.onError(socket, 'Room not found');
				} else if (existingRoom.players.length === 2) {
					this.onError(socket, 'Room is full');
				} else {
					existingRoom.joinRoom(socket, payload.name);
				}

				return;

			default:
				this.onError(socket, 'Invalid action');
				return;
		}
	};

	onClose = (socket) => {
		console.log(`❌ WebSocket disconnected: ${socket._socket.remoteAddress}`);

		const room = this.rooms.findRoom(socket.roomCode);
		room.leaveRoom(socket);

		if (room.playersCount === 0) {
			this.rooms.deleteRoom(room.roomCode);
		}
	};

	onError = (socket, message) => {
		socket.send(`Error: ${message}`);
	};
}
