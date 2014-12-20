var gmuStart = (function() {
	var init = function init() {
		d3.csv("styles.csv", function(data) {
			gmuModel.init(data);
			gmuView.init(50); //720,480,50
			gmuController.init();
		});
	};
	
	return {
		init: init
	};
})()