import { WebSocketServer } from 'ws';

class Player {
	constructor(socket, name, symbol) {
		this.socket = socket;
		this.name = name;
		this.symbol = symbol;
	}
}

class Room {
	constructor(roomCode) {
		this.roomCode = roomCode;
		this.players = [];
	}

	messageAll(message, exludeSocket = null) {
		this.players.forEach((p) => {
			if (!exludeSocket || p.socket !== exludeSocket) {
				p.socket.send(message);
			}
		});
	}

	roomLog(message) {
		console.log(`Room ${this.roomCode}: ${message}`);
	}

	joinRoom(socket, name) {
		// Set symbol and create new player
		const symbol = this.players.length === 0 ? 'X' : 'O';
		const player = new Player(socket, name, symbol);

		// Add to players array
		this.players.push(player);

		// Log action and notify other players
		const roomMessage = `Player ${name} has joined the room as "${symbol}"`;
		this.roomLog(roomMessage);

		if (this.players.length > 1) {
			this.messageAll(roomMessage, socket);
		}
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

	findRoom(roomCode) {
		return this.rooms.get(roomCode);
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
}

export default class TicTacToeSocket {
	constructor(server) {
		// Create WebSocket server off of HTTP server
		this.wss = new WebSocketServer({ server });
		this.rooms = new Rooms();

		// Wire up connection to methods
		this.wss.on('connection', this.onConnection);
	}

	onConnection = (socket) => {
		console.log(`✅ New WebSocket connection: ${socket._socket.remoteAddress}`);

		// Socket Handlers
		socket.on('message', (message) => this.onMessage(socket, message));
		socket.on('close', () => this.onClose(socket));
	};

	onMessage = (socket, message) => {
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
	};

	onError = (socket, message) => {
		socket.send(`Error: ${message}`);
	};
}
