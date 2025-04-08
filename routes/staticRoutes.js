// Import Dependencies
import express from 'express';
import path from 'path';
import __dirname from '../utils/getDirname.js';

// Create router instance
export const router = express.Router();

// Game Page
router.get('/game/:code', (req, res) => {
	res.status(200).sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Home Page
router.get('/', (_, res) => {
	res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});
