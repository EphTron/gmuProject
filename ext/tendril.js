

var mouse = {x: 0, y: 0};

document.addEventListener('mousemove', function(e){ 
  mouse.x = e.clientX || e.pageX; 
  mouse.y = e.clientY || e.pageY 
}, false);

// constants
var padding = 10
var w = window.innerWidth - padding;
var h = window.innerHeight- padding;
var cols = 0;
var rows = 0;
var rect_count = 1000;
var grid_data = new Array();
var rect_opacity = 0.2;
var hotspot_list = new Array();
var gridContainer = d3.select("#gmuGrid")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
var color_scale = d3.scale.linear()
  .domain([0,14])
  .range(["#111111","green"]);

var grow_time = 1000;
var max_angle = 3*Math.PI/4;
var branch_length = w / 30;
var branch_queue = new Array();
var plant_data = new Array();
var branch_count = 0;
var artContainer = d3.select("#gmuPlant")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

// run
init_tendril();
grow_tendril(0,60);

init_grid(rect_count);
draw_grid();

// functions
function init_grid(r_count){
  cols = Math.round(Math.sqrt(r_count * (w/h)));
  rows = Math.round(r_count / cols);

  var _r_w = w / cols; // calc width of rects
  var _r_h = h / rows; // calc height of rects

  var idx = 0;
  for(var r = 0; r < rows; r++){
    for(var c = 0; c < cols ; c++){
      grid_data[idx] = new Object();
      grid_data[idx]["id"]      = idx;
      grid_data[idx]["pos_x"]   = _r_w * c;
      grid_data[idx]["pos_y"]   = _r_h * r;
      grid_data[idx]["width"]   = _r_w;
      grid_data[idx]["height"]  = _r_h;
      grid_data[idx]["touched"] = 0;
      idx++;
    }
  }
}

function get_element_under_rect(x,y){
  var resulting_element;
  var first_element = document.elementFromPoint(x,y);
  //check if first_element is a rect
  if (first_element.nodeName == "rect") {
    _display = first_element.style.display;             // save display of rect
    first_element.style.display = "none";      // make rect invisible
    resulting_element = document.elementFromPoint(x,y); 
    first_element.style.display = _display;    // reset display
  } else {
    resulting_element = first_element;
  }
  return resulting_element;
}

function draw_grid(){
  var rectGrid = gridContainer.selectAll("rect")
    .data(grid_data)
    .enter()
    .append("rect");

  rectGrid.attr("id", function(d,i){return "r"+i;})
    .attr("x", function(d,i){return grid_data[i].pos_x})
    .attr("y", function(d,i){return grid_data[i].pos_y})
    .attr("width", function(d,i){return grid_data[i].width})
    .attr("height", function(d,i){return grid_data[i].height})
    .attr("fill", "#111111")
    .attr("fill-opacity", rect_opacity)
    .attr("stroke", "grey")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", rect_opacity)
    .style("pointer-events","auto")
    .on("mouseover",  function(d,i) {
      gridContainer.select("#r"+parseInt(d.id))
                    .transition()
                    .duration(30)
                    .attr("fill","green")
                    .attr("fill-opacity", rect_opacity);
      update_hotspots(d.id);
      //d.touched++;
      //update_hotspots(d.id);
    })
    .on("mouseout",  function(d,i) {
      gridContainer.select("#r"+parseInt(d.id))
                    .transition()
                    .duration(1000)
                    .attr("fill",color_scale(d.touched))
                    .attr("fill-opacity", rect_opacity);
    })
    .on("click", function(d,i) {
      
      var element = get_element_under_rect( mouse.x, mouse.y );
      if(typeof element === 'undefined'){
         
      }else {
        element.click();
      }
        
    }); 
}

function update_hotspots(id){
  grid_data[id].touched++;
  // add rect to hotspot_list
  // sort hotspot_list
  if(hotspot_list.indexOf(grid_data[id]) == -1){
    hotspot_list.push(grid_data[id]);
  }
  
  // gridContainer.select("#r"+parseInt(id))
  //                   .transition()
  //                   .duration(30)
  //                   .attr("fill",color_scale(grid_data[id].touched))
  //                   .attr("fill-opacity", rect_opacity);
  //console.log("Before Sort",hotspot_list)

  // sort list - front most touches - back less touches
  hotspot_list.sort( function compare(a,b) {
    if (a.touched > b.touched)
       return -1;
    if (a.touched < b.touched)
      return 1;
    return 0;
  });

  // use this hotspot list to calc near hotspot while growing
  // -> see find_near_hotspor()
}

function init_tendril(){
  var a = Math.PI/3
  var _alpha = -Math.PI/2;
  var _omega = _alpha + a *Math.random() - a/2
  //_alpha + a *Math.random() - a/2

  //-3*Math.PI/8;a *Math.random()
  
  //max_angle * Math.random() + (max_angle/2) ;
  var _start = { "x":w/2, 
                 "y":h};
  var _middle = { "x": _start.x + 2*(branch_length * Math.cos(_omega - _alpha) ),
                  "y": _start.y + 2*(branch_length * Math.sin(_omega - _alpha) )}; 
  var _end = { "x": _start.x + 4* branch_length * Math.cos(_omega), 
               "y": _start.y + 4* branch_length * Math.sin(_omega)}; 

  var _root = new Array();
  _root.push(_start);
  _root.push(_middle)
  _root.push(_end);

  plant_data[0] = new Object();
  plant_data[0]["id"] = 0;
  plant_data[0]["branch"] = _root;
  plant_data[0]["angle"] = _omega;
  plant_data[0]["generation"] = 0;
  plant_data[0]["children"] = [1];
  plant_data[0]["branchlet"] = ["b1"];
  plant_data[0]["parent"] = -1;
  branch_count++;

  branch_queue.push(0);
  draw_branches([0]);
}


function create_tendril_branch(object){
  new_child_id = object.children[0]
  plant_data[new_child_id] = new Object();
  
  var _old_end = plant_data[object.id].branch[2];
  var _old_mid = plant_data[object.id].branch[1];
  var _old_omega = plant_data[object.id].angle;
  var _omega = _old_omega + Math.random() * max_angle - (max_angle / 2); 
  var _start = { "x": _old_end.x, 
                 "y": _old_end.y};

  var _middle = { "x": _start.x + branch_length * Math.cos(_omega/1.2) * 0.5, //+ (Math.random() * 200) - 100,
                  "y": _start.y + (branch_length * Math.sin(_omega/1.2) * 0.5)  }; 

  //var _end = find_hottest_hotspot(_start);
  var _end = find_closest_hotspot(_start, 10);
  if (_end.x == 0 && _end.y == 0){
    console.log("finding hottest point")
    _end = find_hottest_hotspot(_start);
    if (_end.x == 0 && _end.y == 0){
      console.log("random point");
      var _end = {"x": _start.x + branch_length * Math.cos(_omega),
                  "y": _start.y + branch_length * Math.sin(_omega)};
    }
  }
  
  var _branch = new Array();
  _branch.push(_start);
  _branch.push(_middle);
  _branch.push(_end);

  plant_data[new_child_id]["id"] = new_child_id;
  plant_data[new_child_id]["branch"] = _branch;
  plant_data[new_child_id]["angle"] = _omega;
  plant_data[new_child_id]["generation"] = object.generation +1;
  plant_data[new_child_id]["children"] = [new_child_id+1];
  plant_data[new_child_id]["parent"] = object.id;
  branch_count++;

  branch_queue.push(new_child_id);
}

function find_hottest_hotspot(location){
  // this function searches for the most touched rect on the grid
  // and calculates a point in the direction
  var _point = {"x": 0, 
                "y": 0};
  if(hotspot_list.length > 0){

    _most_touched_rect =  hotspot_list[0];
    //_most_touched_rect = hotspot_list.shift();
    hotspot_list[0].touched--;
    if ( hotspot_list[0].touched< 0){
      hotspot_list[0].touched = 0;
    }
    // gridContainer.select("#r"+parseInt(d.id))
    //         .transition()
    //         .duration(1000)
    //         .attr("fill",color_scale(d.touched))
    //         .attr("fill-opacity", rect_opacity);

    _r_x = randomIntFromInterval(0,Math.floor(_most_touched_rect.width));
    _x = _most_touched_rect.pos_x + _r_x;
    _r_y = randomIntFromInterval(0,Math.floor(_most_touched_rect.height));
    _y = _most_touched_rect.pos_y + _r_y;
    
    _vec_length = Math.sqrt((_x-location.x) * (_x-location.x)+ (_y-location.y) * (_y-location.y))
    _vec_norm = {"x": (_x-location.x) / _vec_length,
                 "y": (_y-location.y) / _vec_length};

    _point = {"x": location.x + branch_length * _vec_norm.x, 
              "y": location.y + branch_length * _vec_norm.y};
  }
  return _point;
}

function find_closest_hotspot(location, candidates){
  var _point = {"x": 0, 
                "y": 0};
  if (hotspot_list.length > 0 && hotspot_list.length < candidates){
    candidates = hotspot_list.length
  }

  if(hotspot_list.length >= candidates){
    _shortest_distance = 500;
    _closest_spot = null;
    // find closest hotspot out of a set of candidates
    for(i = 0; i < candidates; i++){
      // calc distance to hotspot_candidate
      _x = hotspot_list[i].pos_x;
      _y = hotspot_list[i].pos_y;
      _vec_length = Math.sqrt((_x-location.x) * (_x-location.x)+ (_y-location.y) * (_y-location.y));
      if (_vec_length < 100){
        console.log("too close")
      }
      else if (_vec_length < _shortest_distance){
        _closest_spot = hotspot_list[i];
        _shortest_distance = _vec_length;
      }
    }
    console.log(_closest_spot);
    // delete hotspot
    if (_closest_spot != null){
      remove_id = hotspot_list.indexOf(_closest_spot);
      //hotspot_list[remove_id].touched -= 2;
      //if (hotspot_list[remove_id].touched <= 0 ){
        hotspot_list.splice(remove_id, 1);
        // gridContainer.select("#r"+parseInt(d.id))
        //             .transition()
        //             .duration(1000)
        //             .attr("fill",color_scale(d.touched))
        //             .attr("fill-opacity", rect_opacity);
      //}
    }
    if (_closest_spot != null){
      _r_x = randomIntFromInterval(0,Math.floor(_closest_spot.width));
      _x = _closest_spot.pos_x + _r_x;
      _r_y = randomIntFromInterval(0,Math.floor(_closest_spot.height));
      _y = _closest_spot.pos_y + _r_y;
      
      _vec_length = Math.sqrt((_x-location.x) * (_x-location.x)+ (_y-location.y) * (_y-location.y))
      _vec_norm = {"x": (_x-location.x) / _vec_length,
                   "y": (_y-location.y) / _vec_length};

      _point = {"x": location.x + branch_length * _vec_norm.x, 
                "y": location.y + branch_length * _vec_norm.y};
    }
  }
  return _point;

  // ideen: wenn kein closer_spot -> wachse zufällig
  // wenn closer_spot zu nah -> setz eine flag, dass blätter wachsen.
  // ast wächst dann nicht mehr weiter
}

function draw_branches(branch_list, time){
  var _branch_count = branch_list.length;
  for (var i = 0; i < _branch_count; i++){
    idx = branch_list.shift();
    var lineFunction = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .interpolate("bundle");
      //bundle
      //monotone
      //cubic

    var plantGraph = artContainer.append("path")
      .attr("d", lineFunction(plant_data[idx].branch))
      .attr("id", "p"+plant_data[idx].id)
      .attr("stroke", "green")
      .attr("stroke-width", 5) //- (plant_data[idx].generation) * 0.4)
      .attr("fill", "none")
      .on("mouseover",  function(d,i) {
        console.log("testetsestset")
    });

    var plant_length = plantGraph.node().getTotalLength();

    plantGraph.attr("stroke-dasharray", plant_length + " " + plant_length)
      .attr("stroke-dashoffset", plant_length)
      .transition()
        //.delay(plant_data[idx].generation * 3000)
        .duration(time)
        .ease("basic")
        .attr("stroke-dashoffset", 0);
  }
}

function grow_tendril(iterations, max_depth){
  if(iterations < max_depth){
    time = 1000;//randomIntFromInterval(grow_time-200, grow_time+200)
    setTimeout(function(){
      var _l = branch_queue.length;
      //console.log(_l)
      for (var i = 0; i < _l; i++){
        idx = branch_queue.shift();

        create_tendril_branch(plant_data[idx]); //create children of last branch

        draw_branches(plant_data[idx].children, time); // draw children of last branch
      }
      iterations++;
      console.log(iterations);
      grow_tendril(iterations,max_depth);
    }, time);
  }
}

function randomIntFromInterval(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}