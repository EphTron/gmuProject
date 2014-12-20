var gmuView = (function() {
	var PUBLIC = {};
	var PRIVATE = {};
	
	PUBLIC.init = function init(padding) {
		initDia(padding);
		drawDia();
		
		initList();
		drawList();
		
		initPie();
		drawPie();
		
		initButtons();
		drawButtons(),
		
		initText();
	}
	
	function initDia(padding) {
		var leftbody = d3.select(".leftbody");
		
		PRIVATE.w = leftbody[0][0].clientWidth - padding;
		PRIVATE.h = Math.round(window.innerHeight*0.96);//480;//720;//
		PRIVATE.diaPadding = padding;//50;
		
		PUBLIC.svgCartesian = leftbody.append("svg")
						.attr("width", Math.round(PRIVATE.w * 0.85))
						.attr("height", PRIVATE.h);
					
		PUBLIC.xAxis = d3.svg.axis()
					.scale(PUBLIC.posScaleX)
					.orient("bottom");
		
		PUBLIC.yAxis = d3.svg.axis()
					.scale(PUBLIC.rankScaleY)//.scale(yearScaleY)
					.orient("left");
					
		PUBLIC.xAxisFisheye = d3.svg.axis()
						.scale(PUBLIC.posFisheyeScaleX)
						.orient("bottom");
						//.tickFormat(d3.format(",d"))
						//.tickSize(-h);
	}
	
	function drawDia() {
		PUBLIC.element = PUBLIC.svgCartesian.append("g")
				.attr("class", "elements")
				.selectAll("circle")
				.data(MV_Model.dataset)
				.enter()
				.append("circle")
				.call(computeAttributes)
				.sort(function(a, b) { 
					return PRIVATE.voteScaleRadius(b.Votes) - PRIVATE.voteScaleRadius(a.Votes);
				});
		
		PUBLIC.svgCartesian.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + (PRIVATE.h-PRIVATE.diaPadding) + ")")
				.call(PUBLIC.xAxis);
		
		PUBLIC.svgCartesian.append("g")
				.attr("class","y axis")
				.attr("transform", "translate(" + PRIVATE.diaPadding + ",0)")
				.call(PUBLIC.yAxis);
	}
	
	function computeAttributes(element) {
	}
	
	function initList() {
	}
	
	function drawList() {
	}
	
	function initPie() {
	}
	
	function drawPie() {
	}
	
	function initText() {
		
	}
	
	function initButtons() {
	}

	function drawButtons() {
	}
	
	return PUBLIC;
	
})()