// Import Dependencies
import { Router } from 'express';
import path from 'path';
import __dirname from '../utils/getDirname.js';

// Create router instance
export const router = new Router();

// Game Page
router.get('/game', (_, res) => {
	res.status(200).sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Home Page
router.get('/', (_, res) => {
	res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});
