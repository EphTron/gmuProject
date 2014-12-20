var gmuModel = (function() {
	var PUBLIC = {
			dataset: 			[],
			countries: 			[],
			genres:				[],
			activeCountries: 	[],
			movies:	 			[],
			countryColors:		{},
			ranking:			{}
	};
	
	// private variables
	var color = d3.scale.category20();
	
	// public member functions
	PUBLIC.init = function init(data) {
	};
	
	// private functions
	function hasOwnProperty(obj, prop) {
	
	}
	
	return PUBLIC;
	
})()