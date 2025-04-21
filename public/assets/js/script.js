const nameInput = document.getElementById('name');
const codeInput = document.getElementById('code');
const createButton = document.getElementById('create');
const joinButton = document.getElementById('join');

createButton.addEventListener('click', (e) => {
	e.preventDefault();

	if (!nameInput.value) {
		return;
	}

	document.location.href = `/game?mode=create&name=${nameInput.value}`;
});

joinButton.addEventListener('click', (e) => {
	e.preventDefault();

	console.log(nameInput.value, codeInput.value);

	if (!nameInput.value || !codeInput.value) {
		return;
	}

	document.location.href = `/game?mode=join&name=${nameInput.value}&room=${codeInput.value}`;
});
