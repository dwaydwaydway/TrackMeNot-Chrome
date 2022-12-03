/*******************************************************************************    
 This file is part of TrackMeNot (Chrome version).
 
 TrackMeNot is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation,  version 2 of the License.
 
 TrackMeNot is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 ********************************************************************************/

var api;
if (chrome === undefined) {
    api = browser;
} else {
    api = chrome;
}

if (!TRACKMENOT)
    var TRACKMENOT = {};

/** The TRACKMENOT.TMNInjected object, 
 * which manages the search behavior and user simulation within TMN's tab,
 * or in the background in "stealth" search mode. Created in tmn_search.js
 * @exports TRACKMENOT.TMNInjected
 * @property {number} current_request_id - the id of the current search request, to prevent duplicate searches 
 * @property {string} tmnCurrentURL - the current search URL, used to keep track of the current search and for message handling/passing with the high-level TMNSearch object in trackmenot.js
 * @property {string} engine - the search engine used in the current search, parsed from the parameter set by TMNSearch
 * @property {string} last_engine - deprecated/unused
 *  */
TRACKMENOT.TMNInjected = function() {
    var debug_script = true;

    var current_request_id = 1;
    var tmnCurrentURL = '';
    var engine = '';
    var last_engine = ''; //unused
    //    var allEvents = ['blur','change','click','dblclick','DOMMouseScroll','focus','keydown','keypress','keyup','load','mousedown','mousemove','mouseout','mouseover','mouseup','select'];

    /** function that checks an anchorClass and anchorlink for characteristic properties
     * of a Google advertisement. 
     * @function testAd_google
     * @inner
     * @param {string} anchorClass
     * @param {string} anchorlink
     * @returns {Boolean} if the inputs look like a Google ad
     * */
    var testAd_google = function(anchorClass, anchorlink) {
        return (anchorlink
                && (anchorClass === 'l' || anchorClass === 'l vst')
                && anchorlink.indexOf('http') === 0
                && anchorlink.indexOf('https') !== 0);
    }

    /** Deprecated function to check anchorClass and anchorlink for characteristic
     * properties of a yahoo ad. Always returns false
     * @function testAd_yahoo
     * @inner
     * @deprecated
     * @param {string} anchorClass
     * @param {string} anchorlink
     * @returns {Boolean} false
     * */
    var testAd_yahoo = function(anchorClass, anchorlink) {
		return false;
        //return (anchorClass === '\"yschttl spt\"' || anchorClass === 'yschttl spt');
    }

    /** Checks anchorClass and anchorlink for characteristic
     * properties of a aol ad.
     * @function testAd_aol
     * @inner
     * @param {string} anchorClass
     * @param {string} anchorlink
     * @returns {Boolean}
     * */
    var testAd_aol = function(anchorClass, anchorlink) {
        return (anchorClass === '\"find\"' || anchorClass === 'find'
                && anchorlink.indexOf('https') !== 0 && anchorlink.indexOf('aol') < 0);
    }

    /** Checks anchorClass and anchorlink for characteristic
     * properties of a Bing ad.
     * @function testAd_bing
     * @inner
     * @param {string} anchorClass
     * @param {string} anchorlink
     * @returns {Boolean}
     * */
    var testAd_bing = function(anchorClass, anchorlink) {
        return (anchorlink
                && anchorlink.indexOf('http') === 0
                && anchorlink.indexOf('https') !== 0
                && anchorlink.indexOf('msn') < 0
                && anchorlink.indexOf('live') < 0
                && anchorlink.indexOf('bing') < 0
                && anchorlink.indexOf('microsoft') < 0
                && anchorlink.indexOf('WindowsLiveTranslator') < 0)
    }
    /** Check anchorClass and anchorlink for characteristic
     * properties of a Baidu ad.
     * @function testAd_baidu
     * @inner
     * @param {string} anchorClass
     * @param {string} anchorlink
     * @returns {Boolean}
     * */
    var testAd_baidu = function(anchorClass, anchorlink) {
        return (anchorlink
                && anchorlink.indexOf('baidu') < 0
                && anchorlink.indexOf('https') !== 0);
    }
    /** Tries to find the Google button four different attrValues, returns the button or undefined.
     * @function getButton_google
     * @inner
     * @returns button DOM element or undefined
     * */
    var getButton_google = function(  ) {
        var button = getElementsByAttrValue(document, 'button', 'name', 'btnG');
        if (!button)
            button = getElementsByAttrValue(document, 'button', 'name', 'btnK');
        if (!button)
            button = getElementsByAttrValue(document, 'input', 'name', 'btnK');
        if (!button)
            button = getElementsByAttrValue(document, 'button', 'jsname', 'Tg7LZd');
            
        return button;
    }
    /** Tries to find the Yahoo button byAttrValue
     * @function getButton_yahoo
     * @inner
     * @returns button DOM element or undefined
     * */
    var getButton_yahoo = function(  ) {
        return getElementsByAttrValue(document, 'input', 'class', 'sbb');
    };
    /** Tries to find the Bing button by DOM element id
     * @function getButton_bing
     * @inner
     * @returns button DOM element or undefined
     * */
    var getButton_bing = function(  ) {
        return document.getElementById('sb_form_go');
    };
    /** Tries to find the AOL button by DOM element id
     * @function getButton_aol
     * @inner
     * @returns button DOM element or undefined
     * */
    var getButton_aol = function(  ) {
        return document.getElementById('csbbtn1');
    };
    /** Tries to find the Baidu button by attrValue
     * @function getButton_aol
     * @inner
     * @returns button DOM element or undefined
     * */
    var getButton_baidu = function(  ) {
        return getElementsByAttrValue(document, 'input', 'value', '????');
    };

    /** Tries to find the Google SearchBox by AttrValue
     * @function SearchBox_google
     * @inner
     * @returns SearchBox DOM element or undefined
     * */
    var SearchBox_google = function( ) {
        return getElementsByAttrValue(document, 'input', 'name', 'q');
    };
    /** Tries to find the Yahoo SearchBox by element id
     * @function SearchBox_yahoo
     * @inner
     * @returns SearchBox DOM element or undefined
     * */
    var SearchBox_yahoo = function(  ) {
        return document.getElementById('yschsp');
    };
    /** Tries to find the Bing SearchBox by element id
     * @function SearchBox_bing
     * @inner
     * @returns SearchBox DOM element or undefined
     * */
    var SearchBox_bing = function(  ) {
        return document.getElementById('sb_form_q');
    };
    /** Tries to find the AOL SearchBox by element id
     * @function SearchBox_aol
     * @inner
     * @returns SearchBox DOM element or undefined
     * */
    var SearchBox_aol = function(  ) {
        return document.getElementById('csbquery1');
    };
    /** Tries to find the Baidu SearchBox by element id
     * @function SearchBox_baidu
     * @inner
     * @returns SearchBox DOM element or undefined
     * */
    var SearchBox_baidu = function(  ) {
        return document.getElementById('kw');
    };

    /** Wrapper function to test if a link is an ad for an input search engine,
     * returns the result of the corresponding ad test function for the input engine,
     * or null if the input engine does not have a testAd function defined.
     * @function testad
     * @inner
     * @param {string} engine_id
     * @param {string} anchorClass
     * @param {string} anchorlink
     * @returns the boolean result of the testAd function or null
     * */
    var testad = function(engine_id,anchorClass, anchorlink) {
        switch (engine_id) {
            case 'google':
                return testAd_google(anchorClass, anchorlink);
                break;
            case 'yahoo':
                return testAd_yahoo(anchorClass, anchorlink);
                break;
            case 'bing':
                return testAd_bing(anchorClass, anchorlink);
                break;
            case 'baidu':
                return testAd_baidu(anchorClass, anchorlink);
                break;
            case 'aol':
                return testAd_aol(anchorClass, anchorlink);
                break;
            default:
                return null;
        }
    };
    
    /** Wrapper function to get the SearchBox for a given search engine,
     * returns the result of the corresponding SearchBox function for the engine or null if the
     * engine does not have a SearchBox function defined.
     * @function get_box
     * @inner
     * @param {string} engine_id
     * @returns the result of the SearchBox function (DOM element if successful) or null
     * */
    var get_box = function(engine_id) {
        switch (engine_id) {
            case 'google':
                return SearchBox_google();
                break;
            case 'yahoo':
                return SearchBox_yahoo();
                break;
            case 'bing':
                return SearchBox_bing();
                break;
            case 'baidu':
                return SearchBox_baidu();
                break;
            case 'aol':
                return SearchBox_aol();
                break;
            default:
                return null;
        }
    };

    /** Wrapper function to test if a link is an ad for a given search engine,
     * returns the result of a correspond ad test function for the engine or null if the
     * engine does not have a testAd function defined.
     * @function testad
     * @inner
     * @param {string} engine_id
     * @param {string} anchorClass
     * @param {string} anchorlink
     * @returns the boolean result of the testAd function or null
     * */
    var get_button = function(engine_id) {
        console.log("searching for button with engine.id = " + engine_id);
        switch (engine_id) {
            case 'google':
                return getButton_google();
                break;
            case 'yahoo':
                return getButton_yahoo();
                break;
            case 'bing':
                return getButton_bing();
                break;
            case 'baidu':
                return getButton_baidu();
                break;
            case 'aol':
                return getButton_aol();
                break;
            default:
                return null;
        }
    };

    //unused/deprecated mapping of search engines to their homepage URLs
    var engine2homepage = {
        'google': 'https://www.google.com/', 
        'yahoo': 'https://www.yahoo.com/', 
        'bing': 'https://www.bing.com/', 
        'baidu': 'https://www.baidu.com/'
    }
    //regex to identify host for isSafeHost function, basically deprecated (function always returns true to accomodate additional search engines)
    var engines_regex = [
        {
            'id': 'google',
            'name': 'Google Searchs',
            "host": "(www\.google\.(co\.|com\.)?[a-z]{2,3})$",
            'regexmap': "^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z]{2,3}\/(search){1}[\?]?.*?[&\?]{1}q=)([^&]*)(.*)$"
        },
        {
            'id': 'yahoo',
            'name': 'Yahoo! Search',
            "host": "([a-z.]*?search\.yahoo\.com)$",
            'regexmap': "^(https?:\/\/[a-z.]*?search\.yahoo\.com\/search.*?p=)([^&]*)(.*)$"
        },
        {
            'id': 'bing',
            'name': 'Bing Search',
            "host": "(www\.bing\.com)$",
            'regexmap': "^(https?:\/\/www\.bing\.com\/search\?[^&]*q=)([^&]*)(.*)$"
        },
        {
            'id': 'baidu',
            'name': 'Baidu Search',
            "host": "(www\.baidu\.com)$",
            'regexmap': "^(https?:\/\/www\.baidu\.com\/s\?.*?wd=)([^&]*)(.*)$"
        }
    ];

    /** Utility function that generates a random number between min and max, inclusive.
     * @function roll
     * @inner
     * @param {Number} min - the minimum
     * @param {Number} max - the maximum
     * */
    function roll(min, max) {
        return Math.floor(Math.random() * (max + 1)) + min;
    }

    /** Utility function to log a message to the console
     * @function cout
     * @inner
     * @param {string} msg
     * */
    function cout(msg) {
        console.log(msg);
    }
    // function debug(msg) {
    //     if (debug_script)
    //         console.log("debug: " + msg);
    // }

    /** Removes HTML tag characters from a string
     * @function stripTags
     * @inner
     * @param {string} htmlStr
     * @returns {string} the cleaned string
     * */
    function stripTags(htmlStr) {
        return htmlStr.replace(/(<([^>]+)>)/ig, "");
    }



    /** Deprecated function to focus the browser on an input element and press enter, 
     * using a timed set of interactions to simulate a user.
     * @function pressEnter
     * @inner
     * @param elt - the element to pressEnter within
     * @deprecated
     * */
    function pressEnter(elt) {
        var timers = getTimingArray();
        var evtDown = new KeyboardEvent("keydown", {"keyCode": 13});
        window.setTimeout(function() {
            elt.dispatchEvent(evtDown);
        }, timers[0]);
        var evtPress = new KeyboardEvent("keypress", {"keyCode": 13});
        window.setTimeout(function() {
            elt.dispatchEvent(evtPress);
        }, timers[1]);
        var evtUp = new KeyboardEvent("keyup", {"keyCode": 13});
        window.setTimeout(function() {
            elt.dispatchEvent(evtUp);
        }, timers[2]);
        window.setTimeout(sendPageLoaded, timers[3])
    }
    ;

    /** Dispatch a keydown event on the first letter of the input string chara 
     * into the input searchBox, simulating a keydown of that character on the keyboard.
     * Used to type queries into the searchBox.
     * @function downKey
     * @inner
     * @param {string} chara - a string to type the first letter of
     * @param searchBox - the DOM element to dispatch the keyboardEvent to
     * */ 
    function downKey(chara, searchBox) {
        var charCode = chara[chara.length - 1].charCodeAt(0);
        var evtDown = new KeyboardEvent("keydown", {"charCode": charCode});
        searchBox.dispatchEvent(evtDown);
    }

    /** Dispatch a keypress event on the first letter of the input string chara 
     * into the input searchBox, simulating a keypress of that character on the keyboard.
     * Used to type queries into the searchBox.
     * @function pressKey
     * @inner
     * @param {string} chara - a string to type the first letter of
     * @param searchBox - the DOM element to dispatch the keyboardEvent to
     * */ 
    function pressKey(chara, searchBox) {
        var charCode = chara[chara.length - 1].charCodeAt(0);
        var evtPress = new KeyboardEvent("keypress", {"charCode": charCode});
        searchBox.dispatchEvent(evtPress);
    }

    /** Dispatch a "input" event into the input searchBox, Used in typing queries into the searchBox.
     * @function inputChar
     * @inner
     * @param {string} chara - unused param
     * @param searchBox - the DOM element to dispatch the input event to
     * */ 
    function inputChar(chara, searchBox) {
        var ev = document.createEvent("Event");
        ev.initEvent("input", true, false);
        searchBox.dispatchEvent(ev);
    }

    /** Dispatch a keyup event on the first letter of the input string chara 
     * into the input searchBox, simulating a keyup/release of that character on the keyboard.
     * Used to type queries into the searchBox.
     * @function releaseKey
     * @inner
     * @param {string} chara - a string to release the first letter of
     * @param searchBox - the DOM element to dispatch the keyup event to
     * */ 
    function releaseKey(chara, searchBox) {
        var charCode = chara[chara.length - 1].charCodeAt(0);
        var evtUp = new KeyboardEvent("keyup", {"charCode": charCode});
        searchBox.dispatchEvent(evtUp);
    }

    /** Dispatch a keyup event on the first letter of the input string chara 
     * into the input searchBox, simulating a keyup/release of that character on the keyboard.
     * Used to type queries into the searchBox.
     * @function releaseKey
     * @inner
     * @param {string} chara - a string to release the first letter of
     * @param searchBox - the DOM element to dispatch the keyup event to
     * */ 
    function simulateClick(engine) {

        var clickIndex = roll(0, 9);
        if (!document || document === "undefined")
            return;
        var pageLinks = document.getElementsByTagName("a");


        var anchorLink, anchorClass;
        var j = 0;
        for (var i = 0; i < pageLinks.length; i++) {
            if (pageLinks[i].hasAttribute("orighref"))
                anchorLink = pageLinks[i].getAttribute("orighref");
            else
                anchorLink = pageLinks[i].getAttribute("href");
            anchorClass = pageLinks[i].getAttribute("class");
            var link = stripTags(pageLinks[i].innerHTML);
            if (testad(engine.id, anchorClass, anchorLink)) {
                j++;
                if (j === clickIndex) {
                    var logEntry = JSON.stringify({
                        'type': 'click',
                        "engine": engine.id,
                        'query': link,
                        'id': current_request_id
                    });
                    add_log(logEntry);
                    try {
                        clickElt(pageLinks[i]);
                        console.log("link clicked");
                    } catch (e) {
                        add_log({
                            'type': 'ERROR',
                            'query': "[ERROR in tmn_search.js] error opening click-through request for: " + e.message,
                            'engine': engine, 
                        });
                        console.log("error opening click-through request for " + e);
                    }
                    return;
                }
            }
        }
    }


    /** Dispatch a keyup event on the first letter of the input string chara 
     * into the input searchBox, simulating a keyup/release of that character on the keyboard.
     * Used to type queries into the searchBox.
     * @function releaseKey
     * @inner
     * @param {string} chara - a string to release the first letter of
     * @param searchBox - the DOM element to dispatch the keyup event to
     * */ 
    function clickButton(searchButton) {
        // var button = get_button(engine.id, document);
        searchButton.click();
        // clickElt(button);
        console.log("send page loaded");
        sendPageLoaded();
    }


    /** Given a browser DOM element, perform a sequence of mousedown, mouseup, and click events,
     * timed to simulate a real user.
     * @function clickElt
     * @inner
     * @param elt - the element to click on
     * */ 
    function clickElt(elt) {
        if (!elt)
            return;
        var timers = getTimingArray();
        var evtDown = new MouseEvent("mousedown");
        window.setTimeout(function() {
            elt.dispatchEvent(evtDown);
        }, timers[0]);
        var evtUp = new MouseEvent("mouseup");
        window.setTimeout(function() {
            elt.dispatchEvent(evtUp);
        }, timers[1]);
        var evtCl = new MouseEvent("click");
        window.setTimeout(function() {
            elt.dispatchEvent(evtCl);
        }, timers[2]);

    }

    /** Used to get search button and boxes, by checking each element
     * of a particular type (e.g. "input") with a particular attribute name (e.g. "name"),
     * with a search engine specific value indicating implicitly it serves a designated 
     * search engine role in the interface.
     * @function getElementsByAttrValue
     * @inner
     * @param dom - the document object model of a webpage
     * @param {string} nodeType - the tag name of the type of node (e.g. "input")
     * @param {string} attrName - the attribute name associated with a particular role-identifying value
     * @param {string} nodeValue - the target value of the attribute
     * @returns either the first matching element or null
     * */
    function getElementsByAttrValue(dom, nodeType, attrName, nodeValue) {
        var outlines = dom.getElementsByTagName(nodeType);
        for (var i = 0; i < outlines.length; i++) {
            if (outlines[i].hasAttribute(attrName) && outlines[i].getAttribute(attrName) === nodeValue)
                return outlines[i];
        }
        return null;
    }

    /** Find all the matching words between a searchValue and the nextQuery.
     * Used to maintain a consistent progression search value state as the query is entered,
     * and prevent duplicate word entry.
     * @function getCommonWords
     * @inner
     * @param {string} searchValue - the current value of the search box
     * @param {string} nextQuery - the next query to send
     * @returns {array} the array of matching words between the searchValue and nextQuery
     * */
    function getCommonWords(searchValue, nextQuery) {
        var searched = searchValue.split(' ');
        var tosearch = nextQuery.split(' ');
        var result = [];
        result = result.concat(searched.filter(function(x) {
            return (tosearch.indexOf(x) >= 0);
        }));
        return result;
    }

    /** Generates a random set of 5 timeout values between 0 and 30 milliseconds to create user like
     * timing for keyboard interactions.
     * @function getTimingArray
     * @inner
     * @returns {array} an array of 5 timeout values between 0 and 30 (JS numbers representing milliseconds)
     * */
    function getTimingArray() {
        var timers = [];
        for (var i = 0; i < 5; i++) {
            timers.push(Math.floor(Math.random() * 30));
        }
        return timers.sort();
    }


    /** Types a given query recursively until completing the query, and then clicks the search box to send it.
     * @function typeQuery
     * @inner
     * @param {string} queryToSend - the query to send
     * @param {string} currIndex - the index of what's been typed, within the queryToSend
     * @param searchBox - the DOM search box
     * @param {string} chara - the remaining untyped part of the queryToSend
     * @param isIncr - unused input variable, set to false in the recursive case
     * @param searchButton - the DOM searchButton element to click when the query has been completed typing
     * @returns {array} an array of 5 timeout values between 0 and 30 (JS numbers representing milliseconds)
     * */
    function typeQuery(queryToSend, currIndex, searchBox, chara, isIncr, searchButton) {
        var nextPress;
        tmnCurrentQuery = queryToSend;

        clickElt(searchBox);
        searchBox.focus();
        if (currIndex < queryToSend.length) {
            // var suggestElt = getQuerySuggestion(doc);	
            /*if (false && Math.random() < 0.02 && suggestElt.length > 0) {
                var index_ = roll(0, suggestElt.length - 1);
                selectElt(suggestElt[index_], searchBox);
                clickElt(suggestElt[index_]);
                blurElt(searchBox);
                updateStatus(searchBox.value);
                return;
            } else {*/
                var newWord = queryToSend.substring(currIndex).split(" ")[0];
                if (newWord.length > 1 && (currIndex === 0 || queryToSend[currIndex - 1] === " ")) {
                    console.log("Checking if " + newWord + " appears in " + searchBox.value);
                    if (!(searchBox.value.indexOf(newWord + " ") < 0)) {
                        console.log("It\s in");
                        if (searchBox.value.indexOf(newWord, currIndex) >= 0) {
                            console.log("We\re movine of " + newWord.length + 1);
                            searchBox.selectionEnd += newWord.length + 1;
                            searchBox.selectionStart = searchBox.selectionEnd;
                        }
                        currIndex += newWord.length;
                        updateStatus(searchBox.value);
                        nextPress = roll(50, 250);
                        window.setTimeout(typeQuery, nextPress, queryToSend, currIndex, searchBox, chara.slice(), false, searchButton);
                        return;
                    }
                }
                chara.push(queryToSend[currIndex]);
                var timers = getTimingArray();
                var textvalue = queryToSend[currIndex];
                window.setTimeout(function() {
                    return downKey(chara, searchBox);
                }, timers[0]);
                window.setTimeout(function() {
                    return pressKey(chara, searchBox);
                }, timers[1]);
                window.setTimeout(function() {
                    return inputChar(chara, searchBox);
                }, timers[2]);
                window.setTimeout(function() {
                    searchBox.value += textvalue;
                }, timers[3]);
                window.setTimeout(function() {
                    return releaseKey(chara, searchBox);
                }, timers[4]);
                updateStatus(searchBox.value);
                currIndex++;
                nextPress = roll(50, 250);
                window.setTimeout(typeQuery, nextPress, queryToSend, currIndex, searchBox, chara.slice(), false, searchButton);
           // }
        } else {
            updateStatus(searchBox.value);
            nextPress = roll(10, 30);
            window.setTimeout(clickButton, nextPress, searchButton);
            // if (Math.random() < 0.5)
            //     window.setTimeout(clickButton, nextPress);
            // else
            //     window.setTimeout(pressEnter, nextPress, searchBox);
            //window.setTimeout( sendCurrentURL, nextpress+1) //no function called sendCurrentURL
        }
    }

    /** Given a base URL and a query term, add the query term to the URL, replacing TMN placeholder characters and
     * encoding the URL. Turns the query term to all lower case letters with 90% probability.
     * @function queryToURL
     * @inner
     * @param {string} url - the base URL for a search engine
     * @param {string} query - the dummy query term to send
     * @returns {string} the encoded URL
     * */
    function queryToURL(url, query) {
        if (Math.random() < 0.9)
            query = query.toLowerCase();
        var urlQuery = url.replace('|', query);
        urlQuery = urlQuery.replace(/ /g, '+');
        var encodedUrl = encodeURI(urlQuery);
        encodedUrl = encodedUrl.replace(/%253/g, "%3");

        return encodedUrl;
    }

    /** Send a query by constructing and sending the query URL, either to the runtime
     * if TMN is not in tab mode, or after simulating user typing and clicking on the searchBox.
     * @function sendQuery
     * @inner
     * @param {string} engine - the search engine
     * @param {string} queryToSend - the dummy query term to send
     * @param {string} tmn_mode - the search mode of TMN (only used here for logging)
     * @param {string} url - the base URL for the search engine
     * @returns null
     * */
    function sendQuery(engine, queryToSend, tmn_mode, url) {
        console.log("[tmn_search.js] sendQuery");
        var host;
        try {
            host = window.location.host;
        } catch (ex) {
            host = "";
        }
        var reg = new RegExp(engine.host, 'g');
        var encodedUrl = queryToURL(url, queryToSend);
        var logEntry = JSON.stringify({
            'type': 'query',
            "engine": engine.id,
            'mode': tmn_mode,
            'query': queryToSend,
            'id': current_request_id
        });
        add_log(logEntry);
        updateStatus(queryToSend);
        if (host === "" || !host.match(reg)) {
            try {
                window.location.href = encodedUrl;
                return encodedUrl;
            } catch (ex) {
                console.log("Caught exception: " + ex);
                add_log({
                    'type': 'ERROR',
                    'query': "[ERROR in tmn_search.js] " + ex.message,
                    'engine': engine, 
                });
                api.runtime.sendMessage({
                    "url": encodedUrl
                });
                return null;
            }

        } else {
            var searchBox = get_box(engine.id);
            var searchButton = get_button(engine.id);
            console.log("searchBox: " + JSON.stringify(searchBox));
            console.log("get_button: " + JSON.stringify(get_button));
            if (searchBox && searchButton && engine !== 'aol') {
                searchBox.value = getCommonWords(searchBox.value, queryToSend).join(' ');
                searchBox.selectionStart = 0;
                searchBox.selectionEnd = 0;
                var chara = new Array();
                typeQuery(queryToSend, 0, searchBox, chara, false, searchButton);
                return null;
            } else {
                tmnCurrentURL = encodedUrl;
                console.log("The searchbox can not be found ");
                try {
                    window.location.href = encodedUrl;
                    return encodedUrl;
                } catch (ex) {
                    console.log("Caught exception: " + ex);
                    add_log({
                        'type': 'ERROR',
                        'query': "[ERROR in tmn_search.js] Caught exception: " + ex.message,
                        'engine': engine, 
                    });
                    api.runtime.sendMessage({
                        "url": encodedUrl
                    });
                    return null;
                }

            }
        }
    }



    /** Always returns true, in order to allow new search engines. 
     * Checks that a host is within the predefined list of engines, 
     * used to stop actions after pageLoad for hosts outside of the four original
     * search engines. 
     * @function isSafeHost
     * @inner
     * @param {string} host
     * @return {Boolean}  */
    function isSafeHost(host) {
        for (var i = 0; i < engines_regex.length; i++) {
            var eng = engines_regex[i];
            var regex = eng.host;
            // console.log("regex :" + regex);
            if (host.match(regex)) {
                return true;
            }
        }
        return true; // used to be false
    }


    /** Sends a "pageLoaded" tmn request object to the runtime environment,
     * with the HTML body of the current page attached.  
     * @function sendPageLoaded
     * @inner
     * */
    function sendPageLoaded() {
        var req = {};
        req.tmn = "pageLoaded";
        if ( document.defaultView.document.body) {
            req.html = document.defaultView.document.body.innerHTML;
        } else {
            req.html = null;
        }
        api.runtime.sendMessage(req);
    }

    /** Sends a tmn log request object to the runtime
     * @function add_log
     * @inner
     * @param {string} msg - the log message to add
     * */
    function add_log(msg) {
        api.runtime.sendMessage({tmnLog: msg});
    }

    /** Sends a tmn updateStatus request object to the runtime
     * @function updateStatus
     * @inner
     * @param {string} msg - the status update message
     * */
    function updateStatus(msg) {
        var req = {
            "updateStatus": msg
        };
        api.runtime.sendMessage(req);
    }

    /** Gets the current URL by sending a currentURL request to the runtime,
     * with a callback wrapper function that calls setTMNCurrentURL with the response url.
     * @function getTMNCurrentURL
     * @inner
     * */
    function getTMNCurrentURL() {
        api.runtime.sendMessage({
            tmn: "currentURL"
        },
        function(response) {
            setTMNCurrentURL(response.url);
        });
    }

    /** Set the current url by sending an input URL to the runtime in a "url" message object
     * @function setTMNCurrentURL
     * @inner
     * @param {string} url 
     * */
    function setTMNCurrentURL(url) {
        tmnCurrentURL = url;
        console.log("Current TMN loc: " + tmnCurrentURL);
        var message = {
            "url": tmnCurrentURL
        };
        api.runtime.sendMessage(message);
        sendPageLoaded();
    }


    return {
        /** Receives all messages to tmn_search.js's TRACKMENOT.TMNInjected runtime. 
         * Only handles tmnQuery requests (to send a query) and click_eng requests (to simulate a click).
         * @function setTMNCurrentURL
         * @inner
         * @param {object} request
         * @param sender - unused param
         * @param sendResponse - unused param
         * */
        handleRequest: function(request, sender, sendResponse) {
            if (request.tmnQuery) {
                last_request_id = current_request_id;
                if (last_request_id >= request.tmnID) {
                    console.log("Duplicate queries ignored");
                    return;
                }
                var engine = JSON.parse(request.tmnEngine);
                console.log("Received: " + request.tmnQuery + " on engine: " + engine.id + " mode: " + request.tmnMode + " tmn id " + request.tmnID);
                
                // if(last_engine != engine){
                //     console.log("Changed search engine, visiting " + engine2homepage[engine.id]);
                //     try {
                //         window.location.href = engine2homepage[engine.id];
                //         setTMNCurrentURL(engine2homepage[engine.id]);
                //         console.log("Visited" + engine2homepage[engine.id]);
                //     } catch (ex) {
                //         console.log("Failed visiting " + engine2homepage[engine.id] + " first. Error: " + ex)
                //     }                    
                // }

                var tmn_query = request.tmnQuery;
                var tmn_mode = request.tmnMode;
                current_request_id = request.tmnID;
                var tmn_URLmap = request.tmnUrlMap;
                var encodedurl = sendQuery(engine, tmn_query, tmn_mode, tmn_URLmap);

                // last_engine = engine;
                
                if (encodedurl !== null) {
                    console.log("scheduling next set url");
                    setTMNCurrentURL(encodedurl);
                }
            }
            if (request.click_eng) {
                try {
                    simulateClick(request.click_eng);
                } catch(ex) {
                    add_log({
                        'type': 'ERROR',
                        'query': "[ERROR in tmn_search.js] Failed so click on results: " + ex.message,
                        'engine': engine, 
                    });
                    console.log("Failed so click on results");
                }
            }
            return; // snub them.
        },
        /** Called on tmn_search.js initialization to check if there is an active TMN tab, 
         * by querying the runtime with a TMN message "isActiveTab", and confirming the response to trigger a hasLoaded function call.
         * @function setTMNCurrentURL
         * @inner
         * @param {object} request
         * @param sender - unused param
         * @param sendResponse - unused param
         * */
        checkIsActiveTab: function() {
            api.runtime.sendMessage({
                tmn: "isActiveTab"
            }, function(response) {
                if ( response && response.isActive) {
                    console.log('Message sent from active tab');
                    TRACKMENOT.TMNInjected.hasLoaded();
                }
            });
       },
       /** Callback function for checkIsActiveTab tmn_search.js initialization function, sets the current TMN URL.
        * @function hasLoaded
        * @inner
        * */
        hasLoaded: function() {
            var host = window.location.host;
            if (!isSafeHost(host)) {
                console.log("Host " + host + " is unsafe");
                window.stop();
                //history.go(-1);
            }
            //  sendPageLoaded();
            getTMNCurrentURL();
        }
    };
}();
TRACKMENOT.TMNInjected.checkIsActiveTab();
api.runtime.onMessage.addListener(TRACKMENOT.TMNInjected.handleRequest);


