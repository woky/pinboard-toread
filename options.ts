let elForm     = document.querySelector('form.settings') as HTMLFormElement;
let elApiToken = document.querySelector('#apiToken') as HTMLInputElement;
let elSubmit   = document.querySelector('button[type="submit"]') as HTMLButtonElement;

elForm.addEventListener('submit', ev => {
	ev.preventDefault();
	browser.storage.sync.set({ apiToken: elApiToken.value });
});

(async () => {
	let { apiToken } = await browser.storage.sync.get('apiToken');
	if (apiToken)
		elApiToken.value = apiToken as string;
})();
