// storage_collector.js for wordle-sync by maxtheaxe

console.log("successfully injected storage collector");
syncStorage();

/**
 * get appropriate name format, based on current page (NYT vs powerlanguage)
 */
function getName(saveName) { // enums in js???
	// if on an NYT page, names need to be converted back
	if (window.location.href.includes("https://www.nytimes.com")) {
		// convert original powerlanguage save names to new NYT format
		// for universal comparison and interoperability between schemes/histories
		// checking for each invidually bc not all are required
		if (saveName === "colorBlindTheme") {
			return "nyt-wordle-cbmode";
		} else if (saveName === "darkTheme") {
			return "nyt-wordle-darkmode";
		} else if (saveName === "gameState") {
			return "nyt-wordle-state";
		} else if (saveName === "statistics") {
			return "nyt-wordle-statistics";
		} else { // nyt-wordle-refresh (no idea what this does) and possibly others
			return saveName; // not found, return self
		}
	}
	// if on powerlanguage page (or future other servers), no conversion needed
	return saveName;
}

/**
 * parse localStorage to JSON (and handle NYT)
 */
function parseLocalStorage() {
	console.log("syncing storage");
	// convert localStorage into a proper JSON (parse substrings)
	var currentLocalStorage = {};
	for (const key in localStorage) {
		// make sure we are only picking up the actual values stored by wordle
		if (typeof(localStorage[key]) === 'string') {
			currentLocalStorage[key] = JSON.parse(localStorage[key]);
			// console.log(`${key} : ${localStorage[key]}`)
		}
	}
	if (window.location.href.includes("https://www.nytimes.com")) { // if on NYT version
		console.log("handling nyt version");
		for (const key in currentLocalStorage) {
			// convert NYT save names to original powerlanguage format
			// for universal comparison and interoperability between schemes/histories
			// checking for each invidually bc not all are required
			if (key === "nyt-wordle-cbmode") {
				currentLocalStorage['colorBlindTheme'] = currentLocalStorage[key];
			} else if (key === "nyt-wordle-darkmode") {
				currentLocalStorage['darkTheme'] = currentLocalStorage[key];
			} else if (key === "nyt-wordle-state") {
				currentLocalStorage['gameState'] = currentLocalStorage[key];
			} else if (key === "nyt-wordle-statistics") {
				currentLocalStorage['statistics'] = currentLocalStorage[key];
			} else { // nyt-wordle-refresh (no idea what this does) and possibly others
				continue; // so key doesn't get deleted (probably new, unhandled one)
			}
			// console.log(currentLocalStorage[key]);
			// get rid of key (only happens if existed as powerlanguage save obj)
			// otherwise, assume it's a new feature and sync as normal
			delete currentLocalStorage[key];
		}
	}
	// console.log(currentLocalStorage); // print cleaned JSON
	return currentLocalStorage;
}

/**
 * update synced storage from local (keep longest history by default)
 */
function syncStorage() { // if I knew JS at all, this would be far more modular
	currentLocalStorage = parseLocalStorage();
	// retrieve backed up storage
	chrome.storage.sync.get('wordleBackup', (result) => {
		// if there is an existing backup, compare it to local storage
		if (result.wordleBackup !== undefined) {
			console.log("found remote backup");
			console.log(result.wordleBackup);
			var retrievedStorage = result.wordleBackup;
			// get length of histories
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
			for (const key in retrievedStorage) { // update local data
				localStorage.setItem(getName(key),
					JSON.stringify(retrievedStorage[key]));
			}
			// check if remote backup is associated with the same day as today
			// calculate "wordle day" for remote and local
			var remotePlayed = retrievedStorage['gameState']['lastPlayedTs']
			var remoteDay = Math.round((new Date(remotePlayed).setHours(
				0, 0, 0, 0) - (new Date(2021,5,19,0,0,0,0)
				).setHours(0, 0, 0, 0)) / 864e5);
			var localPlayed = currentLocalStorage['gameState']['lastPlayedTs']
			var localDay = Math.round((new Date(localPlayed).setHours(
				0, 0, 0, 0) - (new Date(2021,5,19,0,0,0,0)
				).setHours(0, 0, 0, 0)) / 864e5);
			// keep some local data if remote assoc w older day
			var keepLocal = ['boardState', 'evaluations', 'gameStatus',
				'lastPlayedTs', 'rowIndex', 'solution'];
			if (localDay > remoteDay) {
				console.log("remote data associated with older day, keeping some local");
				// update retrievedStorage with correct local values, in
				// order to rewrite localStorage more easily
				// for (const key in keepLocal)
				for (let i = 0; i < keepLocal.length; i++) {
					let key = keepLocal[i]
					// for old powerlanguage version
					// if (window.location.href.includes("query")) // if query in url
					retrievedStorage['gameState'][key] = currentLocalStorage['gameState'][key];
				}
				for (const key in retrievedStorage) { // update local data from fixed
					localStorage.setItem(getName(key),
						JSON.stringify(retrievedStorage[key]));
				}
			}
			chrome.storage.sync.set({'wordleBackup': currentLocalStorage}, () => {
				location.reload(); // refresh page to load retrieved data
			});
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
	if (s === '???' || s === 'Enter') {
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
