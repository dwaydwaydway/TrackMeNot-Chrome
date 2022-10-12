- A description of the intended obfuscation algorithm that combines the features above. This can be a high-level or pseudocode description. Think of the approach we had tried in Spring: from the moment the user installs TMN, what’s going to happen? Think about when a dummy query is going to be triggered, when a random walk happens, when query extraction takes place, etc. What's the sequence of actions? What about parallel threads?  If there are gaps of things you don’t know or aren’t sure about, just write it down and keep going. Writing/drawing all this will help you understand better what needs to be done (plus it's part of the documentation that you'll have to prepare). 

When a user install the extension, there will be a list of initial dummy queries. Every T seconds, TrackMeNot will randomly chose one query from this query list to do random walks. 
Also while the user is browsing, we will use keyword extraction/autocomplete suggestion to extract queries and add them to the query list.

Note: we are still struggling to develop a universal template to extract keywords from an arbitrary website.


- A description of what’s already implemented in TMN at the moment. You mentioned that there was some kind of random walk-ish functionality, as well as some sort of user typing simulation. How much of all this is already there? How can you build on top of it? What needs to be done still or rewritten?

Functions already exist:
Search queries in different platforms, including google, bing, yahoo(keep)
Combine different words in word dictionary, and generate random queries(keep or remove)
Click several search results, but only deep one level(improve to random walk)
Typing query(keep)
New tab to search queries, which will be stored in browser history(keep)

Functions implemented so far:
Monitoring & stored queries that users actually searched for

Functions TODO:
Expand to other search engines
Random walk based on search results
More ways to fulfill query bank(keyword extraction, auto complete)
