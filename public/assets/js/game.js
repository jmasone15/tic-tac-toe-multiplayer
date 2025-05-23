let socket;
let symbol;
let code;
let playerTurn = false;

const urlParams = new URLSearchParams(window.location.search);
const roomCodeSpan = document.getElementById('room-code');
const gameDiv = document.getElementById('game');
const waitingPara = document.getElementById('waiting');
const turnSpan = document.getElementById('turn');
const symbolSpan = document.getElementById('symbol');

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
	});

	socket.addEventListener('message', ({ data }) => {
		const extracted = JSON.parse(data);
		console.log(extracted);

		if (extracted.type === 'room-data') {
			symbol = extracted.payload.symbol;
			code = extracted.payload.code;
			roomCodeSpan.innerText = code;

			symbolSpan.textContent = symbol;
		} else if (extracted.type === 'start') {
			waitingPara.setAttribute('class', 'd-none');
			gameDiv.setAttribute('class', '');

			playerTurn = extracted.payload.first === symbol;

			turnSpan.innerText = playerTurn ? 'Your' : 'Opponent';
		}
	});
};

const gameButtons = document.querySelectorAll('button');

gameButtons.forEach((btn) => {
	btn.addEventListener('click', () => {
		if (!playerTurn) {
			console.log('not your turn');
			return;
		}

		const value = btn.getAttribute('data-value');

		if (!value) {
			console.log('play');
			btn.setAttribute('data-value', symbol);
			btn.textContent = `[${symbol}]`;
		} else {
			console.log('taken');
		}
	});
});

init();
