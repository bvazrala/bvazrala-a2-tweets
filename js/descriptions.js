// All tweets that contain user-written text (filled in once the tweets load)
let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// Filter to just the written tweets
	writtenTweets = runkeeper_tweets
		.map(tweet => new Tweet(tweet.text, tweet.created_at))
		.filter(tweet => tweet.written);

	// In case the user typed something before the tweets finished loading
	updateSearchResults();
}

// Reads the search box, finds matching written tweets, and redraws the table
function updateSearchResults() {
	const searchBox = document.getElementById('textFilter');
	const table = document.getElementById('tweetTable');
	const query = searchBox.value;

	document.getElementById('searchText').innerText = query;
	table.innerHTML = '';

	// Clear the table when the search text is empty
	if (query === '') {
		document.getElementById('searchCount').innerText = 0;
		return;
	}

	// Case-insensitive search through the user-written part of each tweet
	const lowerQuery = query.toLowerCase();
	const matches = writtenTweets.filter(tweet => tweet.writtenText.toLowerCase().includes(lowerQuery));

	document.getElementById('searchCount').innerText = matches.length;
	table.innerHTML = matches.map((tweet, index) => tweet.getHTMLTableRow(index + 1)).join('');
}

function addEventHandlerForSearch() {
	// Start with an empty search
	document.getElementById('searchCount').innerText = 0;
	document.getElementById('searchText').innerText = '';

	// 'input' fires every time a character is added or removed
	document.getElementById('textFilter').addEventListener('input', updateSearchResults);
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});
