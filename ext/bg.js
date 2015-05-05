
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

  if (changeInfo.status == 'complete') {
		alert("hi");

    // Execute some script when the page is fully (DOM) ready
    //chrome.tabs.executeScript(null, {code:"init();"});
		//var url = tab.url;
		//var amazon = url.substring(11,17);
		//var product = url.substring(24,31);
		//chrome.tabs.insertCSS( {file: "gmuStyle.css"});
		chrome.tabs.executeScript( tabId,{file: "d3/d3.min.js"});
		chrome.tabs.executeScript( tabId,{file: "jQuery.js"});
		chrome.tabs.executeScript( tabId,{file: "setup.js" });
		chrome.tabs.executeScript( tabId,{code: "setup_structure();" });
		//chrome.tabs.executeScript( {file: "tendril.js" });
		chrome.tabs.executeScript( tabId,{file: "plant.js" });
		alert("works");
    }
});