let socket;
let symbol;
let code;
let moveCount = 0;
let playerTurn = false;
let gameButtonsGrid = [];

const winScenarios = [
	// Row
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	// Column
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	// Diagonal
	[0, 4, 8],
	[6, 4, 2]
];

const urlParams = new URLSearchParams(window.location.search);
const roomCodeSpan = document.getElementById('room-code');
const gameDiv = document.getElementById('game');
const waitingPara = document.getElementById('waiting');
const turnSpan = document.getElementById('turn');
const symbolSpan = document.getElementById('symbol');
const gameButtons = document.querySelectorAll('button');

const init = () => {
	const mode = urlParams.get('mode');
	const name = urlParams.get('name');

	if (!mode || !name) {
		document.location.href = '/';
		return;
	}

	socket = new WebSocket('ws://localhost:3001');

	socket.addEventListener('open', () => {
		if (mode === 'create') {
			socket.send(JSON.stringify({ type: 'create-room', payload: { name } }));
		} else if (mode === 'join') {
			const roomCode = urlParams.get('room');
			socket.send(
				JSON.stringify({ type: 'join-room', roomCode, payload: { name } })
			);
		}

		// Create Game Grid Array
		for (let i = 0; i < 3; i++) {
			let temp = [];
			for (let j = 0; j < 3; j++) {
				temp.push(gameButtons[i + j]);
			}
			gameButtonsGrid.push(temp);
		}
	});

	socket.addEventListener('message', ({ data }) => {
		const { type, payload } = JSON.parse(data);
		console.log(type, payload);

		if (type === 'room-data') {
			symbol = payload.symbol;
			code = payload.code;
			roomCodeSpan.innerText = code;

			symbolSpan.textContent = symbol;
		} else if (type === 'start') {
			waitingPara.setAttribute('class', 'd-none');
			gameDiv.setAttribute('class', '');

			playerTurn = payload.first === symbol;

			turnSpan.innerText = playerTurn ? 'Your' : 'Opponent';
		} else if (type === 'move') {
			console.log('opponent move');

			const btn = document.getElementById(payload.locationId);
			btn.setAttribute('data-value', payload.symbol);
			btn.textContent = `[${payload.symbol}]`;

			if (payload.isWin) {
				alert('You lose!');
			} else {
				playerTurn = true;
			}
		}
	});
};

const isMoveWinning = (locationId) => {
	if (moveCount < 3) {
		return false;
	}

	let isWin = false;
	let filteredScenarios = winScenarios.filter((x) =>
		x.includes(parseInt(locationId) - 1)
	);

	for (let i = 0; i < filteredScenarios.length; i++) {
		const scenario = filteredScenarios[i];
		const matchingSymbolCells = scenario.filter(
			(cell) => gameButtons[cell].getAttribute('data-value') === symbol
		);

		isWin = matchingSymbolCells.length === 3;
	}

	return isWin;
};

gameButtons.forEach((btn) => {
	btn.addEventListener('click', () => {
		if (!playerTurn) {
			console.log('not your turn');
			return;
		}

		const value = btn.getAttribute('data-value');
		const locationId = btn.getAttribute('id');

		if (!value) {
			playerTurn = false;
			moveCount++;

			btn.setAttribute('data-value', symbol);
			btn.textContent = `[${symbol}]`;

			let isWin = isMoveWinning(locationId);

			socket.send(
				JSON.stringify({
					type: 'move',
					roomCode: code,
					payload: { symbol, locationId, isWin }
				})
			);

			if (isWin) {
				alert('You win!');
			}
		} else {
			console.log('taken');
		}
	});
});

init();
