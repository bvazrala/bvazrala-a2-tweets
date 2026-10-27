class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        const lower = this.text.toLowerCase();

        // Completed events: "Just completed a 5.00 km run...", "Just posted a yoga practice in 1:00:00..."
        // (plus a few "Completed a 6.37 km walk..." tweets from a third-party app)
        if (lower.startsWith("just completed") || lower.startsWith("just posted") || lower.startsWith("completed a")) {
            return "completed_event";
        }
        // Live events: "Watch my run right now with @Runkeeper Live ..."
        if (lower.startsWith("watch my") || lower.includes("right now with @runkeeper live")) {
            return "live_event";
        }
        // Achievements: "Achieved a new personal record..." or "I just set a goal on #Runkeeper!..."
        if (lower.startsWith("achieved") || lower.includes("set a goal")) {
            return "achievement";
        }
        // Everything else is general RunKeeper discussion
        return "miscellaneous";
    }

    // The tweet text with the tweet link(s) and the #RunKeeper hashtag removed
    private get cleanedText():string {
        return this.text
            .replace(/https?:\/\/\S+/g, "")
            .replace(/#runkeeper/gi, "")
            .trim();
    }

    // Pulls out the part of the tweet the user typed themselves.
    // RunKeeper's default tweets look like "Just completed a 5.00 km run with @Runkeeper. Check it out!"
    // When a user adds their own text, RunKeeper puts it after " - " instead of the default phrase:
    // "Just completed a 5.00 km run - Beautiful morning!"
    private parseWrittenText():string {
        const cleaned = this.cleanedText;
        const dashIndex = cleaned.indexOf(" - ");
        if (dashIndex === -1) {
            return "";
        }
        const userText = cleaned.substring(dashIndex + 3).trim();
        // TomTom watches auto-fill this phrase, so it is not user-written either
        if (userText === "TomTom MySports Watch") {
            return "";
        }
        return userText;
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        return this.parseWrittenText().length > 0;
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        return this.parseWrittenText();
    }

    // Matches completed-event tweets such as:
    //   "Just completed a 4.87 km run with @Runkeeper..."   -> distance 4.87, unit km, activity "run"
    //   "Just posted an elliptical workout in 30:00 ..."    -> no distance, activity "elliptical workout"
    private static readonly ACTIVITY_PATTERN =
        /^(?:just completed|just posted|completed) an? (?:([\d.,]+) (km|mi) )?(.+?)(?= in \d| with| - | @ |\s+https|\s*$)/i;

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        const match = this.text.match(Tweet.ACTIVITY_PATTERN);
        if (match === null) {
            return "unknown";
        }
        return match[3].trim().toLowerCase();
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const match = this.text.match(Tweet.ACTIVITY_PATTERN);
        if (match === null || match[1] === undefined) {
            return 0; // time-based activity (e.g., yoga) with no distance
        }
        const value = parseFloat(match[1].replace(",", "."));
        const unit = match[2].toLowerCase();
        if (unit === "km") {
            return value / 1.609; // convert kilometers to miles
        }
        return value;
    }

    // ---------- Bonus: simple word-list sentiment of the user-written text ----------
    private static readonly POSITIVE_WORDS = [
        "good", "great", "nice", "love", "loved", "awesome", "amazing", "beautiful", "best", "happy",
        "fun", "fantastic", "excellent", "perfect", "wonderful", "enjoy", "enjoyed", "enjoying", "lovely",
        "strong", "glad", "proud", "easy", "gorgeous", "better", "pb", "pr", "win", "success",
        "brilliant", "super", "yay", "thanks", "grateful", "blessed",
        "😊", "😁", "😀", "💪", "👍", "❤", "🙌", "😎"
    ];
    private static readonly NEGATIVE_WORDS = [
        "bad", "hard", "tough", "tired", "pain", "painful", "sore", "hurt", "hurts", "injury", "injured",
        "struggle", "struggled", "awful", "terrible", "horrible", "worst", "hate", "sick", "ugh",
        "brutal", "exhausted", "difficult", "miserable", "cramp", "cramps", "sad", "lazy", "rough",
        "boring", "fail", "failed",
        "😩", "😫", "😞", "😢", "😭", "🥵"
    ];

    // returns 'positive', 'negative', or 'neutral' by counting positive and negative words
    get sentiment():string {
        const text = this.writtenText.toLowerCase();
        const words = text.split(/[^a-z']+/);
        // plain words must match a whole word; emoji just need to appear somewhere
        const contains = (term:string):boolean => /^[a-z']+$/.test(term) ? words.includes(term) : text.includes(term);

        let score = 0;
        for (const word of Tweet.POSITIVE_WORDS) {
            if (contains(word)) {
                score++;
            }
        }
        for (const word of Tweet.NEGATIVE_WORDS) {
            if (contains(word)) {
                score--;
            }
        }
        if (score > 0) {
            return "positive";
        }
        if (score < 0) {
            return "negative";
        }
        return "neutral";
    }

    getHTMLTableRow(rowNumber:number):string {
        // Turn every link in the tweet into a clickable <a> tag
        const linkedText = this.text.replace(/(https?:\/\/[^\s…]+)/g, '<a href="$1" target="_blank">$1</a>');

        // Bonus: color-coded sentiment column
        const sentimentClass = this.sentiment === "positive" ? "text-success"
            : this.sentiment === "negative" ? "text-danger" : "text-secondary";

        return "<tr>" +
            "<td>" + rowNumber + "</td>" +
            "<td>" + this.activityType + "</td>" +
            "<td>" + linkedText + "</td>" +
            '<td class="' + sentimentClass + '">' + this.sentiment + "</td>" +
            "</tr>";
    }
}
