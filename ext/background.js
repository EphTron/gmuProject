chrome.browserAction.onClicked.addListener(function(tab) {
  
  var url = tab.url;
  //var amazon = url.substring(11,17);
  //var product = url.substring(24,31);

  chrome.tabs.executeScript( {file: "d3/d3.min.js"});
  chrome.tabs.executeScript( {file: "setup.js" });
  chrome.tabs.executeScript( {file: "tendril.js" });
});
