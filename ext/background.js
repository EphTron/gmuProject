// chrome.browserAction.onClicked.addListener(function(tab) {
  
//   var url = tab.url;
//   //var amazon = url.substring(11,17);
//   //var product = url.substring(24,31);
//   chrome.tabs.insertCSS( {file: "gmuStyle.css"});
//   chrome.tabs.executeScript( {file: "d3/d3.min.js"});
//   chrome.tabs.executeScript( {file: "jQuery.js"});
//   chrome.tabs.executeScript( {file: "setup.js" });
//   //chrome.tabs.executeScript( {file: "tendril.js" });
//   chrome.tabs.executeScript( {file: "tendril.js" });
// });
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {

		var url = tab.url;
		//var amazon = url.substring(11,17);
		//var product = url.substring(24,31);
		chrome.tabs.insertCSS( {file: "gmuStyle.css"});
		chrome.tabs.executeScript( {file: "d3/d3.min.js"});
		chrome.tabs.executeScript( {file: "jQuery.js"});
		chrome.tabs.executeScript( {file: "setup.js" });
		//chrome.tabs.executeScript( {file: "tendril.js" });
		chrome.tabs.executeScript( {file: "plant.js" });

  }
})

// chrome.tabs.insertCSS( {file: "gmuStyle.css"});
// chrome.tabs.executeScript( {file: "d3/d3.min.js"});
// chrome.tabs.executeScript( {file: "jQuery.js"});
// chrome.tabs.executeScript( {file: "setup.js" });
// //chrome.tabs.executeScript( {file: "tendril.js" });
// chrome.tabs.executeScript( {file: "tendril.js" });

chrome.browserAction.onClicked.addListener(function(tab) {
  
  var url = tab.url;
  //var amazon = url.substring(11,17);
  //var product = url.substring(24,31);
  chrome.tabs.insertCSS( {file: "gmuStyle.css"});
  chrome.tabs.executeScript( {file: "d3/d3.min.js"});
  chrome.tabs.executeScript( {file: "jQuery.js"});
  chrome.tabs.executeScript( {file: "setup.js" });
  chrome.tabs.executeScript( {file: "plant.js" });
});