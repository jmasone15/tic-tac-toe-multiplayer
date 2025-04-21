let socket;
const urlParams = new URLSearchParams(window.location.search);

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
		console.log(data);
	});
};

init();
