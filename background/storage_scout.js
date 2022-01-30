// storage_scout.js for wordle-sync by maxtheaxe

// window.addEventListener('storage', () => {
// 	console.log("https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event")
// 	// When local storage changes, dump the list to
// 	// the console.
// 	console.log(JSON.parse(window.localStorage.getItem('gameState')));
// 	console.log(JSON.parse(window.localStorage.getItem('statistics')));
// });

/*
Log the storage area that changed,
then for each item changed,
log its old value and its new value.
*/
function logStorageChange(changes, area) {
	console.log("Change in storage area: " + area);

	let changedItems = Object.keys(changes);

	for (let item of changedItems) {
		console.log(item + " has changed:");
		console.log("Old value: ");
		console.log(changes[item].oldValue);
		console.log("New value: ");
		console.log(changes[item].newValue);
	}
}

console.log("hello mr stupid")

browser.storage.onChanged.addListener(logStorageChange);
