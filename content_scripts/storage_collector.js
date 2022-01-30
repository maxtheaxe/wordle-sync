// storage_collector.js for wordle-sync by maxtheaxe

console.log("i injected myself! i hope im making u proud :)");
// console.log(JSON.parse(window.localStorage.getItem('gameState')));

/**
 * update synced storage from local
 */
function syncStorage(updatedStorage) {
	// pass
}

// listen for storage changes (either upon submission of new word or storage event)

/**
 * when local storage changes (in another tab/window), call storageSync()
 */
window.addEventListener('storage', () => {
	// i see (on MDN) that this a thing that can't work on the same page
	//  that is making the changes, but why is that the case?
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
	console.log("detected storage event");
	console.log(JSON.parse(window.localStorage.getItem('gameState')));
	console.log(JSON.parse(window.localStorage.getItem('statistics')));
});

// /**
//  * when the user hits their enter key, call storageSync()
//  */
// window.addEventListener('keypress', (e) => {
// 	if (e.key === 'Enter') {
// 		console.log("detected enter keypress")
// 		storageSync() // order a storage update
// 	}
// 	else if (e.key === '↵') {
// 		console.log("detected onscreen enter keypress")
// 		storageSync() // order a storage update
// 	}
// 	else {
// 		console.log(`a key was pressed: ${e}`)
// 	}
// });

/**
 * when the user hits their enter key, call storageSync()
 */
window.addEventListener('game-key-press', (e) => {
	var s = e.detail.key; // something defined by the wordle guy
	if (s === '↵' || s === 'Enter') {
		console.log("detected enter keypress")
		// storageSync() // order a storage update
	}
});

// "game-setting-change"