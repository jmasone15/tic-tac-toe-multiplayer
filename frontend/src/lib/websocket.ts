const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
	console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
	console.log('Received:', event.data);
};

export default function sendMessage(msg: string) {
	ws.send(msg);
}
