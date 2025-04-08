<script>
	import '../lib/global.css';
</script>

<div class="container">
	<h1>✨ Tic Tac Toe</h1>
	<button style="background-color: #1bc71b;">Create New Room</button>
	<div style="margin-top: 4rem;">
		<p>Have a code?</p>
		<input type="text" placeholder="Enter room code" max="21" />
		<button style="background-color: #4D96FF;">Join Room</button>
	</div>
</div>

<style>
	h1 {
		margin-bottom: 1rem;
		color: var(--text-color);
	}

	p {
		color: var(--text-color);
		font-weight: bold;
	}

	button {
		width: 100%;
		padding: 1rem;
		margin-top: 1rem;
		border: none;
		border-radius: 1rem;
		font-size: 1.2rem;
		color: white;
		cursor: pointer;
		transition: filter 0.3s ease;
	}

	input {
		width: 100%;
		padding: 0.8rem;
		border-radius: 1rem;
		border: 2px solid #ddd;
		margin-top: 0.5rem;
		font-size: 1rem;
	}

	.container {
		text-align: center;
		width: 100%;
		max-width: 400px;
		background: var(--card-bg);
		border-radius: 2rem;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
		padding: 2rem;
	}

	button:hover {
		filter: brightness(1.1);
	}

	@media (max-width: 500px) {
		h1 {
			font-size: 1.5rem;
		}

		button {
			font-size: 1rem;
		}
	}
</style>
