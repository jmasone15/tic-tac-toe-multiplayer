<script lang="ts">
	import sendMessage from '$lib/websocket';

	let input = '';

	function send() {
		if (input.trim()) {
			sendMessage(input);
			input = '';
		}
	}
</script>

<input bind:value={input} type="text" placeholder="Type a message..." />
<button onclick={send}>Send</button>
