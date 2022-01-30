// storage_collector.js for wordle-sync by maxtheaxe

console.log("successfully injected storage collector");

/**
 * update synced storage from local (keep longest history by default)
 */
function syncStorage() { // if I knew JS at all, this would be far more modular
	console.log("syncing storage");
	// convert localStorage into a proper JSON (parse substrings)
	var currentLocalStorage = {};
	for (const key in localStorage){
		// make sure we are only picking up the actual values stored by wordle
		if(typeof(localStorage[key]) === 'string'){
			currentLocalStorage[key] = JSON.parse(localStorage[key])
			// console.log(`${key} : ${localStorage[key]}`)
		}
	}
	// console.log(currentLocalStorage) // print cleaned JSON
	// retrieve backed up storage
	chrome.storage.sync.get('wordleBackup', (result) => {
		// if there is an existing backup, compare it to local storage
		if (result.wordleBackup !== undefined) {
			console.log("found remote backup");
			console.log(result.wordleBackup);
			var retrievedStorage = result.wordleBackup;
			// get length of histories
			console.log(`here: ${retrievedStorage['statistics']}`);
			var storedLength = 0; // remote backup has no games played
			var localLength = 0; // local backup has no games played
			if (retrievedStorage['statistics'] !== undefined) {
				if (retrievedStorage['statistics']['gamesPlayed'] !== undefined) {
					storedLength = retrievedStorage['statistics']['gamesPlayed'];
				}
			}
			else {
				var storedLength = 0; // existing backup had no games played
			}
			if (currentLocalStorage['statistics'] !== undefined) {
				if (currentLocalStorage['statistics']['gamesPlayed'] !== undefined) {
					localLength = currentLocalStorage['statistics']['gamesPlayed'];
				}
			}
			console.log("retrieved stored and local lengths");
			// identify longer history
			if (storedLength > localLength) {
				console.log("stored > local");
				var useLocal = false;
			}
			else if (localLength > storedLength) {
				console.log("local > stored");
				var useLocal = true;
			}
			else { // same number of games played, need to compare moves on current game
				console.log("stored = local");
				console.log(`remote index: ${retrievedStorage['gameState']['rowIndex']}`);
				console.log(`local index: ${currentLocalStorage['gameState']['rowIndex']}`);
				if (retrievedStorage['gameState']['rowIndex'] > currentLocalStorage['gameState']['rowIndex']) {
					var useLocal = false;
				}
				else { // should default to using local if equal, smoother UX
					var useLocal = true;
				}
			}
		}
		else { // no remote backup found, so use local
			console.log("no remote backup found");
			var useLocal = true;
		}
		// rectify history difference (either update remote from local or vice versa)
		if (!useLocal) { // if remote is newer, update local storage
			console.log("remote is newer, updating local storage");
			for (const key in retrievedStorage){
				localStorage.setItem(key, JSON.stringify(retrievedStorage[key]))
			}
			location.reload(); // refresh page to load retrieved data
		}
		else { // local is newer, so update remote storage
			console.log("local is newer, updating remote storage");
			chrome.storage.sync.set({
				'wordleBackup': currentLocalStorage
			});
		}
	});
}

// listen for storage changes (either upon submission of new word or setting change)
// I'd love to just listen for storage events, but that's not
// a thing within the same page for some reason

/**
 * when the user hits their enter key (onscreen or on kb), call storageSync()
 */
window.addEventListener('game-key-press', (e) => {
	var s = e.detail.key; // from custom event defined by the wordle guy
	if (s === '↵' || s === 'Enter') {
		console.log("detected enter keypress");
		syncStorage(); // order a storage update
	}
});

/**
 * when the user changes a setting, call storageSync()
 */
window.addEventListener('game-setting-change', () => {
	console.log("detected setting change");
	syncStorage(); // order a storage update
});
