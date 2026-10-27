function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Only completed tweets have an activity type and distance
	const completedTweets = tweet_array.filter(tweet =>
		tweet.source === 'completed_event' && tweet.activityType !== 'unknown');

	// ----- Count how many tweets there are of each activity type -----
	const activityCounts = {};
	for (const tweet of completedTweets) {
		const type = tweet.activityType;
		activityCounts[type] = (activityCounts[type] || 0) + 1;
	}
	// Sort activity types from most to least common
	const sortedActivities = Object.keys(activityCounts).sort((a, b) => activityCounts[b] - activityCounts[a]);
	const topThree = sortedActivities.slice(0, 3);

	document.getElementById('numberActivities').innerText = sortedActivities.length;
	document.getElementById('firstMost').innerText = topThree[0];
	document.getElementById('secondMost').innerText = topThree[1];
	document.getElementById('thirdMost').innerText = topThree[2];

	// ----- Plot 1: number of tweets of each activity type -----
	// Vega-Lite needs plain objects, so build a new array of values to graph
	const activityData = completedTweets.map(tweet => ({activityType: tweet.activityType}));

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityData
	  },
	  "width": 600,
	  "mark": "bar",
	  "encoding": {
	    "x": {"field": "activityType", "type": "nominal", "sort": "-y", "title": "Activity type"},
	    "y": {"aggregate": "count", "type": "quantitative", "title": "Number of tweets"},
	    "tooltip": [
	      {"field": "activityType", "type": "nominal", "title": "Activity"},
	      {"aggregate": "count", "type": "quantitative", "title": "Tweets"}
	    ]
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	// ----- Plots 2 and 3: distance by day of the week for the three most common activities -----
	const topThreeTweets = completedTweets.filter(tweet => topThree.includes(tweet.activityType));
	const distanceData = topThreeTweets.map(tweet => ({
		activityType: tweet.activityType,
		distance: tweet.distance,
		time: tweet.time
	}));

	const distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Distances of the three most-tweeted activities by day of the week.",
	  "data": {"values": distanceData},
	  "mark": "point",
	  "encoding": {
	    "x": {"field": "time", "timeUnit": "day", "type": "ordinal", "title": "time (day)"},
	    "y": {"field": "distance", "type": "quantitative", "title": "distance (miles)"},
	    "color": {"field": "activityType", "type": "nominal", "title": "activityType"}
	  }
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});

	const distance_vis_aggregated_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Mean distance of the three most-tweeted activities by day of the week.",
	  "data": {"values": distanceData},
	  "mark": "point",
	  "encoding": {
	    "x": {"field": "time", "timeUnit": "day", "type": "ordinal", "title": "time (day)"},
	    "y": {"field": "distance", "aggregate": "mean", "type": "quantitative", "title": "Mean of distance"},
	    "color": {"field": "activityType", "type": "nominal", "title": "activityType"}
	  }
	};
	vegaEmbed('#distanceVisAggregated', distance_vis_aggregated_spec, {actions:false});

	// ----- Answer which activity is longest/shortest and whether weekends or weekdays are longer -----
	// (These could be hard-coded from the graphs, but computing them keeps the page dynamic.)
	const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;

	const meanDistanceByType = {};
	for (const type of topThree) {
		meanDistanceByType[type] = average(topThreeTweets.filter(t => t.activityType === type).map(t => t.distance));
	}
	const byMeanDistance = topThree.slice().sort((a, b) => meanDistanceByType[b] - meanDistanceByType[a]);
	document.getElementById('longestActivityType').innerText = byMeanDistance[0];
	document.getElementById('shortestActivityType').innerText = byMeanDistance[byMeanDistance.length - 1];

	// getDay(): 0 = Sunday, 6 = Saturday
	const isWeekend = tweet => tweet.time.getDay() === 0 || tweet.time.getDay() === 6;
	const weekendMean = average(topThreeTweets.filter(isWeekend).map(t => t.distance));
	const weekdayMean = average(topThreeTweets.filter(t => !isWeekend(t)).map(t => t.distance));
	document.getElementById('weekdayOrWeekendLonger').innerText = weekendMean > weekdayMean ? 'weekends' : 'weekdays';
}

// Toggles between the plot of every activity and the plot of the means when the button is pressed
function addEventHandlerForAggregate() {
	const button = document.getElementById('aggregate');
	const allVis = document.getElementById('distanceVis');
	const meanVis = document.getElementById('distanceVisAggregated');

	// Start by showing every activity
	allVis.style.display = 'block';
	meanVis.style.display = 'none';
	button.innerText = 'Show means';

	button.addEventListener('click', function () {
		if (meanVis.style.display === 'none') {
			meanVis.style.display = 'block';
			allVis.style.display = 'none';
			button.innerText = 'Show all activities';
		} else {
			meanVis.style.display = 'none';
			allVis.style.display = 'block';
			button.innerText = 'Show means';
		}
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForAggregate();
	loadSavedRunkeeperTweets().then(parseTweets);
});
