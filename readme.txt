--Readme document for Bala Kausik Vazrala, bvazrala@uci.edu--

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

10/10
- 3/3 Summarizing tweets
- 4/4 Identifying the most popular activities
- 3/3 Adding a text search interface
- Bonus (+1): sentiment mining (see question 5)

2. How long, in hours, did it take you to complete this assignment?

3 hours; not all at once. Actually got really sick and wasn't able to finish assignment in time. I learned from this experience, I'll start early next time. 

3. What online resources did you consult when completing this assignment? (list sites like StackOverflow or specific URLs for tutorials; describe queries to Generative AI or use of AI-based code completion)

I used Generative AI (Claude) to understand syntax and pick up potential bugs. Also used it to learn about package management. Other than that, I looked at documentation and notes. 


Other references the code relies on:
- MDN: toLocaleDateString, String.startsWith/includes, regular expressions, addEventListener('input')
- Math.js format(): https://mathjs.org/docs/reference/functions/format.html
- Vega-Lite docs (mark, encoding, timeUnit, aggregate): https://vega.github.io/vega-lite/docs/

4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?

None.

5. Is there anything special we need to know in order to run your code?

Compile the TypeScript first with: tsc --p tsconfig.json   (then open the pages, e.g. with live-server)

Notes on my parsing rules (ts/tweet.ts):
- source: "Just completed..." / "Just posted..." / "Completed a..." = completed event; "Watch my ... right now
  with @Runkeeper Live" = live event; "Achieved a new personal record" / "I just set a goal" = achievement;
  everything else = miscellaneous.
- written / writtenText: after removing the link(s) and #Runkeeper, user text is whatever follows " - "
  (RunKeeper's default text is "with @Runkeeper. Check it out!"; "TomTom MySports Watch" is also auto-filled
  and is not counted as user-written).
- activityType / distance: parsed with a regular expression from "Just completed a <number> <km|mi> <activity>";
  km are converted to miles (1 mi = 1.609 km). Time-based activities (e.g. yoga) have a distance of 0.
- On the activities page, the longest/shortest activity and weekday-vs-weekend answers are computed from the
  data (average distance) rather than hard-coded.

Bonus feature: Sentiment mining. On the "What people are saying" page, each search result has a Sentiment
column (positive / negative / neutral). It is computed in the Tweet class's `sentiment` getter by counting
words/emoji from small positive and negative word lists in the user-written text. I added the column header
to descriptions.html for this.
