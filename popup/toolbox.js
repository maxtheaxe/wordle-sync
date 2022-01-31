// toolbox.js for wordle-sync by maxtheaxe

/**
 * log the error to the console
 */
function reportError(error) {
	console.error(`could not complete requested operation: ${error}`);
}

/**
 * listen for clicks on the buttons, and take appropriate action
 */
function listenForClicks() {
	document.addEventListener("click", (e) => {
		if (e.target.id === "help") {
			let url = "https://github.com/maxtheaxe/wordle-sync/issues";
			window.open(url, '_blank').focus();
		}
		else if (e.target.id === "share") {
			let url = "https://twitter.com/intent/tweet?text=I%27m%20using%20wordlesync.com%20to%20sync%20my%20wordle%20progress%20across%20all%20my%20devices.";
			window.open(url, '_blank').focus();
		}
		else if (e.target.id === "author") {
			let url = "https://max.bio/";
			window.open(url, '_blank').focus();
		}
	});
}

listenForClicks(); // start listening for clicks within the toolbox