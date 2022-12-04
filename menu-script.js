var api;
if (chrome == undefined) {
		api = browser;
	} else {
		api = chrome;
	}

if(!TRACKMENOT) var TRACKMENOT = {};

/** The TrackMeNot menu displayed from its browser icon.
 * @exports TRACKMENOT.Menus
 * @property {object} options - the current TMN options
 * */
TRACKMENOT.Menus = function() {
  var options = null;
  


    
  /** Logs an input msg to the console 
   * @funciton _cout
   * @inner
   * @param {string} msg - the message to log
   * */
  function  _cout (msg) { console.log(msg);  }
  


  return { 
      /** Opens a link to the TMN FAQ page.
       * @function showHelp
       * @inner
       * */
   showHelp: function() {
    window.open("http://www.cs.nyu.edu/trackmenot/faq.html")
  },
   /** Toggles whether TMN is enabled or disabled in options, saves new options to local storage,
    * and reloads the menu HTML.
    * @function toggleOnOff
    * @inner
    * */
   toggleOnOff: function() {   
       console.log("toggling option in menu");
       options.enabled = !options.enabled      

       console.log("saving options in menu-script.js");
       console.log(JSON.stringify(options));
       api.storage.local.set({"options_tmn":options});
       TRACKMENOT.Menus.onLoadMenu({"options_tmn":options});
       console.log("new options");
       getStorage("options_tmn", logGotItem);

   },
    
   /** Changes the state of the useTab option, sets a new set of options in local storage, amnd reloads the HTML for the menu 
    * @function toggleTabFrame
    * @inner
    * */
   toggleTabFrame: function() {
        options.useTab = !options.useTab
        api.storage.local.set({"options_tmn":options});
        TRACKMENOT.Menus.onLoadMenu({"options_tmn":options});  
      },

      /** Loads the UI HTML for the menu, based on the values of the options within the input items.
       * @function onLoadMenu
       * @inner
       * @param {object} items - container object for options_tmn to load into the menu
       * */
     onLoadMenu: function( items ) {
         options = items["options_tmn"];
      
		if ( options.enabled) {
			 $("#trackmenot-enabled").html('Disable');
			 $("#trackmenot-img-enabled").attr("src", "images/skin/off_icon.png");
		}  else {
			 $("#trackmenot-enabled").html('Enable');
			 $("#trackmenot-img-enabled").attr("src", "images/skin/on_icon.png");
		}
			
		if (options.useTab)  $("#trackmenot-menu-useTab").html('<img  width="16" height="16" src="images/skin/stealth_icon.png" /> Stealth');
		else $("#trackmenot-menu-useTab").html('<img  width="16" height="16" src="images/skin/tab_icon.png" /> Tab')
      }
  }
}(); 

document.addEventListener('DOMContentLoaded', function () {
  $("#trackmenot-menu-useTab").click(TRACKMENOT.Menus.toggleTabFrame);
  $("#trackmenot-enabled").click(TRACKMENOT.Menus.toggleOnOff);
  $("#trackmenot-menu-win").click(function() { window.open(api.extension.getURL('options.html'));});
  $("#trackmenot-menu-help").click(TRACKMENOT.Menus.showHelp)
  api.storage.local.get(["options_tmn"],TRACKMENOT.Menus.onLoadMenu)
});
/** Callback function that logs the word "Error" to the console.
 * @function onError
 * */
function onError(){
  console.log("Error");
}

/**from https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/get 
 * Logs a got item from local storage to the console
 * @function logGotItem
 * @param item - the item to log to the console
 * */
function logGotItem(item) {
    console.log(item);
}
/** Get items by input keys from local storage, and pass them to the input callback function.
 * @param {array} keys - a list of local storage item keys
 * @param {function} callback - callback function to pass gotten items
 * */
function getStorage(keys,callback) {
    try {
        let gettingItem = api.storage.local.get(keys);
        gettingItem.then(callback, onError);
    } catch (ex) {
        api.storage.local.get(keys,callback); 
    }   
}
