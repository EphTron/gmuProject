var a = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
a.src = chrome.extension.getURL('d3/d3.min.js');
a.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(a);


var b = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
b.src = chrome.extension.getURL('jQuery.js');
b.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(b);