// Formats a fraction (0 to 1) as a percentage string with exactly two decimal places, e.g. "96.82%"
function formatPercent(count, total) {
	if (total === 0) {
		return "0.00%";
	}
	return math.format(count / total * 100, {notation: 'fixed', precision: 2}) + "%";
}

// Sets the text of every element with the given class name (some classes appear more than once in the HTML)
function setTextForClass(className, text) {
	const elements = document.querySelectorAll('.' + className);
	for (const element of elements) {
		element.innerText = text;
	}
}

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;

	// ----- Tweet dates: find the earliest and latest tweet -----
	let earliest = tweet_array[0].time;
	let latest = tweet_array[0].time;
	for (const tweet of tweet_array) {
		if (tweet.time < earliest) {
			earliest = tweet.time;
		}
		if (tweet.time > latest) {
			latest = tweet.time;
		}
	}
	const dateOptions = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
	document.getElementById('firstDate').innerText = earliest.toLocaleDateString('en-US', dateOptions);
	document.getElementById('lastDate').innerText = latest.toLocaleDateString('en-US', dateOptions);

	// ----- Tweet categories: count how many tweets fall into each source -----
	const counts = {completed_event: 0, live_event: 0, achievement: 0, miscellaneous: 0};
	for (const tweet of tweet_array) {
		counts[tweet.source]++;
	}
	const total = tweet_array.length;

	setTextForClass('completedEvents', counts.completed_event);
	setTextForClass('completedEventsPct', formatPercent(counts.completed_event, total));
	setTextForClass('liveEvents', counts.live_event);
	setTextForClass('liveEventsPct', formatPercent(counts.live_event, total));
	setTextForClass('achievements', counts.achievement);
	setTextForClass('achievementsPct', formatPercent(counts.achievement, total));
	setTextForClass('miscellaneous', counts.miscellaneous);
	setTextForClass('miscellaneousPct', formatPercent(counts.miscellaneous, total));

	// ----- User-written tweets: of the completed events, how many include user-written text -----
	const completedTweets = tweet_array.filter(tweet => tweet.source === 'completed_event');
	const writtenCount = completedTweets.filter(tweet => tweet.written).length;
	setTextForClass('written', writtenCount);
	setTextForClass('writtenPct', formatPercent(writtenCount, completedTweets.length));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
