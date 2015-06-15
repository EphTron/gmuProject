var mouse = {x: 0, y: 0};

document.addEventListener('mousemove', function(e){ 
    mouse.x =  e.pageX; 
    mouse.y =  e.pageY; 
}, false);

// constants
var padding = 10

// variables
var w = window.innerWidth - padding;
//var h = window.innerHeight- padding;
var body = document.body,
    html = document.documentElement;

var h = Math.max( body.scrollHeight, body.offsetHeight, 
                  html.clientHeight, html.scrollHeight, html.offsetHeight );

var artContainer = d3.select("#gmuRanke")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("z-index", 100000000000)
    .attr("pointer-events", "none");

// var gridContainer = d3.select("#pluginGrid")
//     .append("svg")
//     .attr("width", w)
//     .attr("height", h);

// var $window = $(window);

// grid variables/globals
var cols = 0;
var rows = 0;
var rect_width = 1;
var rect_height = 1;
var rect_count = 250;
var point_id  = 0;
var rect_opacity = 0.2;
var grid_exists = false;

var points = new Array();
var grid_data = new Array();
var hotspots = new Array();

var color_scale = d3.scale.linear()
    .domain([0,14])
    .range(["#111111","green"]);

// tendril variables/globals

var grow_time = 800;
var branch_length = 30;
var tendril_segments = 40;

var global_tendril_count = 0;
var global_tendril_id = 0;

var last_angle = 0;
var age_counter = 0;
var branch_count = 0;
var _sta = {"x": w-1,
            "y": randomIntFromInterval(50, h -50)};
var _mid = {"x": randomIntFromInterval(0,w),
            "y": randomIntFromInterval(0,h)};
var _end = {"x": randomIntFromInterval(0,w),
            "y": randomIntFromInterval(0,h)};
var _triple = new Array(_sta, _mid, _end);

var start_points = new Array(_triple);
var init_list = new Array();
var tendril_queue = new Array();
var plant_data = new Array();
var age_queue = new Array();
var draw_queue = new Array();

var last_direction = { "x": 0,
                       "y": 1}; 

// Execute on load
// Bind event listener
d3.select(window).on('resize', check_size); 

function checkDocumentHeight(callback){
    var lastHeight = document.body.clientHeight, newHeight, timer;
    (function run(){
        newHeight = document.body.clientHeight;
        if( lastHeight != newHeight )
            callback();
        lastHeight = newHeight;
        timer = setTimeout(run, grow_time/2);
    })();
}

checkDocumentHeight(check_size);
//$(window).resize(checkWidth);

console.log("Hello Plugin");
init_grid(rect_count);
//draw_grid();
track_cursor(50);

run_time_growth();


function check_size() {
    w = window.innerWidth - padding;
    //var h = window.innerHeight- padding;
    body = document.body,
    html = document.documentElement;

    var temp_h = Math.max( body.scrollHeight, body.offsetHeight, 
                  html.clientHeight, html.scrollHeight, html.offsetHeight );

    if (temp_h > h){
        h = temp_h;
    }
    //gridContainer.attr("width", w).attr("height", h);
    artContainer.attr("width", w).attr("height", h);
    update_grid();
}


//######## Init functions   ########
function track_cursor(time){
    setInterval(function(){
        var _p  = {"x": mouse.x,
                   "y": mouse.y };
        var _id = get_rect_id_by_pos(_p);
        update_hotspots(_id);
    },time);
}

function init_grid(r_count){
    cols = Math.round(Math.sqrt(r_count * (w/h)));
    rows = Math.round(r_count / cols);

    rect_width = w / cols; // calc width of rects
    rect_height = h / rows; // calc height of rects

    var idx = 0;
    for(var r = 0; r < rows; r++){
        for(var c = 0; c < cols ; c++){
            grid_data[idx] = new Object();
            grid_data[idx]["id"]      = idx;
            grid_data[idx]["pos_x"]   = rect_width * c;
            grid_data[idx]["pos_y"]   = rect_height * r;
            grid_data[idx]["width"]   = rect_width;
            grid_data[idx]["height"]  = rect_height;
            grid_data[idx]["touched"] = 0;
            grid_data[idx]["visited"] = 0;
            idx++;
        }
    }
}

function update_grid(){
    cols = Math.round(Math.sqrt(rect_count * (w/h)));
    rows = Math.round(rect_count / cols);

    rect_width = w / cols; // calc width of rects
    rect_height = h / rows; // calc height of rects

    var idx = 0;
    for(var r = 0; r < rows; r++){
        for(var c = 0; c < cols ; c++){
            if (idx > grid_data.length-1){
                grid_data[idx] = new Object();
            }
            grid_data[idx]["pos_x"]   = rect_width * c;
            grid_data[idx]["pos_y"]   = rect_height * r;
            grid_data[idx]["width"]   = rect_width;
            grid_data[idx]["height"]  = rect_height;
            idx++;
        }
    }
}

function draw_grid(){
    hotspots.push(grid_data[1]);
    hotspots.push(grid_data[8]);
    console.log("redraw grid")
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
                         .duration(70)
                         .attr("fill","green")
                         .attr("fill-opacity", rect_opacity);
            update_hotspots(d.id);
            if (grid_data[d.id].visited > grid_data[d.id].touched){
                gridContainer.select("#r"+parseInt(d.id))
                         .transition()
                         .duration(70)
                         .attr("fill","red")
                         .attr("fill-opacity", rect_opacity);
            }

        })
        .on("mouseout",  function(d,i) {
            gridContainer.select("#r"+parseInt(d.id))
                         .transition()
                         .duration(1000)
                         .attr("fill",color_scale(d.touched))
                         .attr("fill-opacity", rect_opacity);
        })
}


function update_hotspots(id){
    if (typeof grid_data[id] != 'undefined') {

        if (grid_data[id].touched < 30){
            grid_data[id].touched++;
        }
        if(hotspots.indexOf(grid_data[id]) == -1){
            hotspots.push(grid_data[id]);
        }
    }
}

function sort_hotspots_by_touches(){
    // sort list - front most touched - back less touched
    hotspots.sort( function compare(a,b) {
        if (a.touched > b.touched)
            return -1;  
        if (a.touched < b.touched)
            return 1;
        return 0;
    });
}

function run_time_growth(){
    setInterval(function(){ 
        check_size();
        console.log("check page size");
    },1000);
    
    setInterval(function(){ 
        sort_hotspots_by_touches();
        
        if(branch_count == 0){
            if (global_tendril_id < 1){
                var _start = { "x":1, 
                               "y":h/3};
                var _p = {"x": mouse.x,
                          "y": mouse.y };
                var _p2 = {"x": randomIntFromInterval(0,w),
                           "y": randomIntFromInterval(0,h)};
                init_new_tendril(_start,_p,_p2);
            }
        }
        else{
            var _temp;
            //console.log("tendrils: ",global_tendril_count)
            for (var i = 0; i < global_tendril_count; i++){
                idx = tendril_queue.shift();
                var _current_mouse_pos  = {"x": mouse.x,
                                           "y": mouse.y };
                if (plant_data[idx].tendril_number < tendril_segments){
                    //create_next_tendril_random_mouse(plant_data[idx],
                    create_next_tendril_hotspot_mouse(plant_data[idx],
                                                     _current_mouse_pos,
                                                     _current_mouse_pos);
                } else {
                    global_tendril_count--;
                }
                _temp = idx;
            }

            draw_branches(draw_queue, grow_time);
            if (plant_data[_temp].tendril_number == tendril_segments/2){
                if(global_tendril_count < 5){
                    var _triple = get_random_start_triple();
                    init_new_tendril(_triple[0],_triple[1],_triple[2]);
                }
            }
        }
        //console.log("start ageing")
        start_ageing();
    }, grow_time);
}

function init_new_tendril(start, point, point2){
    //console.log("init new branch")
    var a = Math.PI / 4
    var _alpha = -Math.PI/2;
    var _start = start;  

    //middle point
    var _omega = get_min_max_angle(_start, _alpha, point, Math.PI/7);
    var _middle = { "x": _start.x + branch_length * Math.cos(_omega),
                    "y": _start.y + branch_length * Math.sin(_omega)};

    //end point
    _omega = get_min_max_angle(_middle, _omega, point2, Math.PI/7);
    var _end = { "x": _middle.x + branch_length * Math.cos(_omega), 
                 "y": _middle.y + branch_length * Math.sin(_omega)};
    
    last_direction = { "x": branch_length * Math.cos(_omega), 
                       "y": branch_length * Math.sin(_omega)};

    var _root = new Array(_start,_middle,_end);

    plant_data[branch_count] = new Object();
    plant_data[branch_count]["id"] = branch_count;
    plant_data[branch_count]["tendril_id"] = global_tendril_id;
    plant_data[branch_count]["tendril_number"] = 0;
    plant_data[branch_count]["branch"] = _root;
    plant_data[branch_count]["angle"] = _omega;
    plant_data[branch_count]["wid"] = 8;
    plant_data[branch_count]["type"] = "ta";
    plant_data[branch_count]["generation"] = 0;
    plant_data[branch_count]["children"] = [];
    plant_data[branch_count]["parent"] = -1;

    global_tendril_id++;
    global_tendril_count++;

    draw_branches([branch_count], 2000);
    tendril_queue.push(branch_count);

    //draw_queue.push(branch_count);

    branch_count++;
}

function draw_branches(branch_list, time){
    //console.log("to draw: ", draw_queue, draw_queue.length)
    var _to_draw = branch_list.length;
    //console.log("Branchlist: ",branch_list)
    for (var i = 0; i < _to_draw; i++){

        idx = branch_list.pop();
        var plant_id = plant_data[idx].id;
        //console.log("drawing", plant_id)
        
        //draw_queue.shift();
        var lineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("cardinal");
            //.interpolate("bundle");
            //.interpolate("basis");
            //.interpolate("cubic");

            //monotone
        //console.log("drawing:", plant_data[idx].id)
        var plantGraph = artContainer.append("path")
            .attr("d", lineFunction(plant_data[idx].branch))
            .attr("id", "p"+plant_data[idx].id)
            .attr("stroke", "green")
            .attr("pointer-events","stroke")
            .attr("stroke-width", plant_data[idx].wid) //- (plant_data[idx].generation) * 0.4)
            .attr("stroke-linecap", "round")  // stroke-linecap type
            //.attr("stroke-opacity", "1.0")  // stroke-linecap type
            .attr("fill", "none")
            .on("mouseover",  function(d,i) {
                _id = this.id;
                _id = _id.substr(1);
                _id = parseInt(_id);
                //draw_grid();

                //console.log("NEW LEAF",_id);
                // if (global_tendril_count < 4){
                //     var _start = plant_data[_id].branch[1];
                //     var _p = {"x": randomIntFromInterval(0,w),
                //               "y": randomIntFromInterval(0,h)};
                //     var _p2 = {"x": randomIntFromInterval(0,w),
                //                "y": randomIntFromInterval(0,h)};
                //     init_new_tendril(_start,_p,_p2);
                // }
                create_leaf(plant_data[_id], plant_data[_id].branch, plant_data[_id].angle, "lb");
            });
            
        var plant_length = plantGraph.node().getTotalLength();

        plantGraph.attr("stroke-dasharray", plant_length + " " + plant_length)
            .attr("stroke-dashoffset", plant_length)
            .transition()
                //.delay(plant_data[idx].generation * 3000)
                .duration(time)
                .ease("linear")
                .attr("stroke-dashoffset", 0);

        setTimeout(function(){
            age_queue.push(age_counter);
            age_counter++;
        },6000);
    } 
}

function get_min_max_angle(ref_point, angle, new_point, max_angle){

    var _dir = { "x": ref_point.x + (branch_length * Math.cos(angle)),
                 "y": ref_point.y + (branch_length * Math.sin(angle))}; 

    var _a = {"x": _dir.x - ref_point.x,
              "y": _dir.y - ref_point.y};

    var _b = {"x": new_point.x - ref_point.x,
              "y": new_point.y - ref_point.y};
    
    var result_angle = dot_product(normalize_vec(_a),normalize_vec(_b));
    
    if (result_angle > 0.999999){
        result_angle = 0.999999
    } else if (result_angle < -0.9999999){
        result_angle = -0.9999999
    }
    result_angle = Math.acos(result_angle);

    if ( result_angle > max_angle){
        result_angle = max_angle;
    }
    // check on which side the next point lies
    var _side = Math.sign((_dir.x-ref_point.x)*(new_point.y-ref_point.y) -
                          (_dir.y-ref_point.y)*(new_point.x-ref_point.x));
    // adjust
    if (_side > 0){
        result_angle = -result_angle;
    }
    result_angle = angle - result_angle;
    
    return result_angle;
}

function dot_product(a, b){

    var result = a.x * b.x + a.y * b.y
    return result
}

function normalize_vec(a){
    _a_length = Math.sqrt((a.x) * (a.x) + (a.y) * (a.y));
     a.x = (a.x) / _a_length;
     a.y = (a.y) / _a_length;
    return a;
}


function create_next_tendril_random_mouse(object, point, point2){
    var new_child_id = branch_count;
    
    object.children.push(new_child_id);

    plant_data[new_child_id] = new Object();

    var _max_angle = Math.PI/5;
    var _old_end = plant_data[object.id].branch[2];
    var _old_mid = plant_data[object.id].branch[1];
    var _old_omega = plant_data[object.id].angle;

    var _start = _old_end;
    //get_next_hotspot_direction(_start);

    var _middle = get_next_grow_point(object.tendril_number + 1, _start, _old_omega, point, _max_angle);

    var _end = get_next_grow_point(object.tendril_number + 1, _middle, last_angle, point2, _max_angle);
    
    var _branch = new Array(_start, _middle,_end);

    plant_data[new_child_id]["id"] = new_child_id;
    plant_data[new_child_id]["tendril_id"] = object.tendril_id;
    plant_data[new_child_id]["tendril_number"] = object.tendril_number + 1;
    plant_data[new_child_id]["branch"] = _branch;
    plant_data[new_child_id]["angle"] = last_angle;
    plant_data[new_child_id]["wid"] = 7;
    plant_data[new_child_id]["type"] = "ta";
    plant_data[new_child_id]["generation"] = object.generation + 1;
    plant_data[new_child_id]["children"] = [];
    plant_data[new_child_id]["parent"] = object.id;

    branch_count++;

    //create fancy leaves for a nice look
    var _old_dir = { "x": branch_length * Math.cos(_old_omega),
                     "y": branch_length * Math.sin(_old_omega)}; 
    var _new_dir = { "x": branch_length * Math.cos(last_angle),
                     "y": branch_length * Math.sin(last_angle)};
    var check_angle = dot_product(normalize_vec(_old_dir),normalize_vec(_new_dir));
    check_angle = Math.acos(check_angle);
    //console.log("angle:",check_angle);
    if(check_angle <0.1){
        create_leaf(object, _branch, last_angle, "la");
    }else if(check_angle <0.3){
        create_leaf(object, _branch, last_angle, "lb");
    }else if(check_angle >0.8){
        create_leaf(object, _branch, last_angle, "lc");
    }else if(check_angle >0.6){
        create_leaf(object, _branch, last_angle, "ld");
    }else {
        // _leaf.push("c");
    }
    draw_queue.push(new_child_id);
    tendril_queue.push(new_child_id);
}


function create_next_tendril_hotspot_mouse(object, point, point2){
    var new_child_id = branch_count;
    
    object.children.push(new_child_id);

    plant_data[new_child_id] = new Object();

    var _max_angle = Math.PI/5;
    var _old_end = plant_data[object.id].branch[2];
    var _old_mid = plant_data[object.id].branch[1];
    var _old_omega = plant_data[object.id].angle;

    var _start = _old_end;

    // get rect old plant was in
    var _current_rect_id = get_rect_id_by_pos(_start);

    var _next_point = point;
    var _hotspot_id = get_next_hotspot_id(_start);
    if (_hotspot_id == -1){
        if (hotspots[0].touched > 15){
            _next_point = get_random_point_on_rect(hotspots[0].id);
        } 
    } else {
        _next_point = get_random_point_on_rect(_hotspot_id);
    }

    var _middle = get_next_grow_point(object.tendril_number +1, _start, _old_omega, _next_point, _max_angle);

    if (_hotspot_id == -1){
        if (hotspots[0].touched > 10){
            _next_point = get_random_point_on_rect(hotspots[0].id);
            console.log("to hottest hotspot");
        } else {
            console.log("to mouse");
        _next_point = point2;
        }
    } else {
        console.log("to near hotspot");
        _next_point = get_random_point_on_rect(_hotspot_id);
    }

    var _end = get_next_grow_point(object.tendril_number + 1, _middle, last_angle, _next_point, _max_angle);
    
    var _branch = new Array(_start, _middle,_end);
    // mark current rect as visited - to avoid growing over it again
    _current_rect_id = get_rect_id_by_pos(_end);
    grid_data[_current_rect_id].touched--;
    grid_data[_current_rect_id].touched--;
    grid_data[_current_rect_id].visited++;

    plant_data[new_child_id]["id"] = new_child_id;
    plant_data[new_child_id]["tendril_id"] = object.tendril_id;
    plant_data[new_child_id]["tendril_number"] = object.tendril_number + 1;
    plant_data[new_child_id]["branch"] = _branch;
    plant_data[new_child_id]["angle"] = last_angle;
    plant_data[new_child_id]["wid"] = 7;
    plant_data[new_child_id]["type"] = "ta";
    plant_data[new_child_id]["generation"] = object.generation + 1;
    plant_data[new_child_id]["children"] = [];
    plant_data[new_child_id]["parent"] = object.id;

    branch_count++;

    //create fancy leaves for a nice look
    var _old_dir = { "x": branch_length * Math.cos(_old_omega),
                     "y": branch_length * Math.sin(_old_omega)}; 
    var _new_dir = { "x": branch_length * Math.cos(last_angle),
                     "y": branch_length * Math.sin(last_angle)};
    var check_angle = dot_product(normalize_vec(_old_dir),normalize_vec(_new_dir));
    check_angle = Math.acos(check_angle);
    //console.log("angle:",check_angle);
    if(check_angle <0.1){
        create_leaf(object, _branch, last_angle, "la");
        create_leaf(object, _branch, last_angle, "la");
        start_points.push(_branch);
    }else if(check_angle <0.3){
        create_leaf(object, _branch, last_angle, "lb");
        create_leaf(object, _branch, last_angle, "lb");
    }else if(check_angle >0.8){
        create_leaf(object, _branch, last_angle, "lc");
        start_points.push(_branch);
    }else if(check_angle >0.6){
        create_leaf(object, _branch, last_angle, "ld");
        create_leaf(object, _branch, last_angle, "ld");
        create_leaf(object, _branch, last_angle, "ld");
    }
    draw_queue.push(new_child_id);
    tendril_queue.push(new_child_id);
}

function create_leaf(object, branch, middle_angle, type){
    var new_leaf_id = branch_count;
    //console.log("leaf id :",new_leaf_id);
    object.children.push(new_leaf_id);
    //new_child_id = object.children[0]
    plant_data[new_leaf_id] = new Object();

    var _old_end = branch[2];
    var _old_mid = plant_data[object.id].branch[1];
    var _old_start = plant_data[object.id].branch[0];
    var _old_omega = plant_data[object.id].angle;

    if (type == "la"){
        // console.log("a")
        var _ran_point = {"x": randomIntFromInterval(0,w),
                          "y": randomIntFromInterval(0,h)};
        var _start = get_next_grow_point(new_leaf_id, _old_mid, middle_angle, _ran_point, Math.PI/8);
        
        _ran_point = {"x": randomIntFromInterval(0,w),
                      "y": randomIntFromInterval(0,h)};
        var _middle = get_next_grow_point(new_leaf_id, _start, last_angle, _ran_point, Math.PI/5);

        _ran_point = {"x": randomIntFromInterval(0,w),
                      "y": randomIntFromInterval(0,h)};
        var _end = get_next_grow_point(new_leaf_id, _middle, last_angle, _ran_point, Math.PI/4);
    } else if (type == "lb" || type == "ld"){
        // console.log("b / d")
        var _ran_point = {"x": randomIntFromInterval(0,w),
                          "y": randomIntFromInterval(0,h)};
        var _start = get_next_grow_point(new_leaf_id, _old_mid, middle_angle, _ran_point, Math.PI/10);
        
        _ran_point = {"x": randomIntFromInterval(0,w),
                          "y": randomIntFromInterval(0,h)};
        var _middle = get_next_grow_point(new_leaf_id, _start, last_angle, _ran_point, Math.PI/10);

        _ran_point = {"x": randomIntFromInterval(0,w),
                      "y": randomIntFromInterval(0,h)};
        var _end = get_next_grow_point(new_leaf_id, _middle, last_angle, _ran_point, Math.PI/10);
    }else if (type == "lc"){
        // console.log("c")
        var _ran_point = {"x": randomIntFromInterval(0,w),
                          "y": randomIntFromInterval(0,h)};
        var _start = get_next_grow_point(new_leaf_id, _old_start, middle_angle, _ran_point, Math.PI/6);
        
        _ran_point = {"x": randomIntFromInterval(0,w),
                      "y": randomIntFromInterval(0,h)};
        var _middle = get_next_grow_point(new_leaf_id, _start, last_angle, _ran_point, Math.PI/4);

        _ran_point = {"x": randomIntFromInterval(0,w),
                      "y": randomIntFromInterval(0,h)};
        var _end = get_next_grow_point(new_leaf_id, _middle, last_angle, _ran_point, Math.PI/2);
    }
    var _branch = new Array(_old_mid, _start, _middle, _end);

    plant_data[new_leaf_id]["id"] = new_leaf_id;
    plant_data[new_leaf_id]["tendril_id"] = object.tendril_id;
    plant_data[new_leaf_id]["tendril_number"] = object.tendril_number;
    plant_data[new_leaf_id]["branch"] = _branch;
    plant_data[new_leaf_id]["angle"] = last_angle;
    plant_data[new_leaf_id]["wid"] = 3;
    plant_data[new_leaf_id]["type"] = type;
    plant_data[new_leaf_id]["generation"] = object.generation +1;
    plant_data[new_leaf_id]["children"] = [];
    plant_data[new_leaf_id]["parent"] = object.id;
    branch_count++;

    draw_queue.push(new_leaf_id);
}

function create_leaf_end(object, branch, middle_angle, type){
    // to do
    // make leafs end smaller 
}

function get_next_grow_point(tendril_id, start, old_angle, new_point, max_angle){
    //var _max_angle = Math.PI/5;
    var _omega = get_min_max_angle(start, old_angle, new_point, max_angle);

    var _dir = { "x": branch_length * Math.cos(_omega), //+ (Math.random() * 200) - 100,
                 "y": branch_length * Math.sin(_omega)}; 
    
    var _beta = get_random_angle_by_direction(tendril_id, _omega, _dir);
    
    _omega = (_omega + (_omega + _beta))/2;

    var _step_end = { "x": start.x + branch_length * Math.cos(_omega), //+ (Math.random() * 200) - 100,
                      "y": start.y + branch_length * Math.sin(_omega)};
    //set the direction of middle as last_direction
    last_direction = {"x": branch_length * Math.cos(_omega),
                      "y": branch_length * Math.sin(_omega)};                
    last_angle = _omega;

    return _step_end;
}

function get_next_hotspot_id(_current_pos){
    // calc pos via id

    var _on_grid_x = Math.floor(_current_pos.x / rect_width);
    var _on_grid_y = Math.floor(_current_pos.y / rect_height);

    if (_on_grid_x < 0 ){
        _on_grid_x = 0
    }
    if (_on_grid_y < 0 ){
        _on_grid_y = 0
    }
    var _rect_id   = Math.abs(_on_grid_y * cols + _on_grid_x);
    var _x_values, _y_values;

    // console.log("Rect:",_rect_id, " X:", _on_grid_x, " Y:", _on_grid_y);
    //console.log("Cols:", cols, " Rows:", rows);
    if (_on_grid_x > 0 && _on_grid_x < cols-1){
        _x_values = new Array(_on_grid_x -1, _on_grid_x, _on_grid_x +1);
    } else if(_on_grid_x == 0){
        _x_values = new Array(_on_grid_x, _on_grid_x +1);
    } else if(_on_grid_x >= cols-1){
        _x_values = new Array(_on_grid_x -1, _on_grid_x);
    }

    if (_on_grid_y > 0 && _on_grid_y < rows-1){
        _y_values = new Array(_on_grid_y -1, _on_grid_y, _on_grid_y +1);
    } else if(_on_grid_y == 0){
        _y_values = new Array(_on_grid_y, _on_grid_y +1);
    } else if(_on_grid_y >= rows-1){
        _y_values = new Array(_on_grid_y -1, _on_grid_y);
    }

    var _hottest_rect_id;
    var _temp_rect_id;
    var _touch_count = 0;
    for (var i = 0; i < _x_values.length; i++){
        for (var j = 0; j < _y_values.length; j++){
            _temp_rect_id = _y_values[j] * cols + _x_values[i];
            if(grid_data[_temp_rect_id].visited < grid_data[_temp_rect_id].touched){
                if (_touch_count < grid_data[_temp_rect_id].touched){
                    _touch_count = grid_data[_temp_rect_id].touched;
                    _hottest_rect_id = _temp_rect_id;
                }
            }
        }
    }

    if (_touch_count > 0){
        return _hottest_rect_id;
    } else {
        return -1;
    }
}

function get_random_start_triple(){
    
    var c = randomIntFromInterval(0,branch_count)
    if (c % 6 == 0 ){
        // left side
        var _sta = {"x": 1,
                    "y": randomIntFromInterval(50, h -100)};
        var _mid = get_random_point_on_rect(hotspots[0].id);
        var _end = get_random_point_on_rect(hotspots[0].id);
        var _triple = new Array(_sta, _mid, _end);
        return _triple;
    } else if (c % 6 == 2){
        // right side
        var _sta = {"x": w-1,
                    "y": randomIntFromInterval(50, h -50)};
        var _mid = get_random_point_on_rect(hotspots[1].id);
        var _end = get_random_point_on_rect(hotspots[1].id);
        var _triple = new Array(_sta, _mid, _end);
        return _triple;
    } else if (c % 6 == 1 || c % 6 == 3 || c % 6 == 4 || c % 6 == 5){
        var i = randomIntFromInterval(0, start_points.length-1);
        console.log("I:", i," Start points: " ,start_points)
        var _triple = start_points[i];
        if (start_points.length > 10){
            start_points.splice(i, 1);
        }
        console.log(start_points[i]);
        var _sta = start_points[i][0];
        var _mid = start_points[i][1];
        var _end = get_random_point_on_rect(hotspots[0].id);
        var _triple = new Array(_sta, _mid, _end);
        return _triple;
    }
}

function get_random_point_on_rect(rect_id){
    if (typeof grid_data[rect_id] != 'undefined') {
        var _point = { "x": randomIntFromInterval(grid_data[rect_id].pos_x, grid_data[rect_id].pos_x + grid_data[rect_id].width),
                       "y": randomIntFromInterval(grid_data[rect_id].pos_y, grid_data[rect_id].pos_y + grid_data[rect_id].height)};
        return _point;
    } else {
        console.log("CURRENT MOUSE");
        var _current_mouse_pos  = {"x": mouse.x,
                                   "y": mouse.y };
        return _current_mouse_pos;
    }
}

function get_rect_id_by_pos(point){
    var _on_grid_x = Math.floor(point.x / rect_width);
    var _on_grid_y = Math.floor(point.y / rect_height);
    var _rect_id   = Math.abs(_on_grid_y * cols + _on_grid_x);
    //onsole.log("Rect:",_rect_id, " X:", _on_grid_x, " Y:", _on_grid_y);
    return _rect_id;
}

function get_random_angle_by_direction(plant_id, omega, new_dir){
    //var _angle = 3*Math.PI/5;
    var _angle = Math.PI/5;
    
    var result_angle = dot_product(normalize_vec(last_direction),normalize_vec(new_dir));
    result_angle = Math.acos(result_angle);
    //console.log ("angle differenz:", result_angle);
    if (result_angle < 0.1){
        if (plant_id % 2 == 0){
            result_angle = _angle * Math.random();
        } else if (plant_id % 2 == 1){
            result_angle = - _angle * Math.random();
        }
    } else if (result_angle > 0.61){ 
        result_angle = _angle * Math.random() - (_angle/2);
    } else {
        result_angle = 0;
    }
    last_direction = new_dir;    
    return result_angle;
}

function start_ageing(){
    while (age_queue.length != 0){
        idx = age_queue.shift();
        //console.log("apply ageing",idx);
        ageing_branch = plant_data[idx];
        console.log("type",ageing_branch.type);

        if (ageing_branch.type == "ta"){
            // if (ageing_branch.tendril_number > tendril_segments-2){
            //     console.log("end");
            //     d3.select("#p"+ageing_branch.id)
            //     .transition()
            //         .duration(16000)
            //         .attr("stroke","rgb(0,128,0)")
            //         .attr("stroke-width",8);
            // } else { 
            console.log("end");
            d3.select("#p"+ageing_branch.id)
                .transition()
                    .duration(16000)
                    .attr("stroke","rgb(50, 80, 32)")
                    .attr("stroke-width",8);
            //}
        } else if (ageing_branch.type == "la"){
            d3.select("#p"+ageing_branch.id)
                .transition()
                    .duration(16000)
                    .attr("stroke","rgb(20, 100, 32)")
                    .attr("stroke-width",4);
        }else if (ageing_branch.type == "lb"){
            d3.select("#p"+ageing_branch.id)
                .transition()
                    .duration(16000)
                    .attr("stroke","rgb(20, 90, 32)")
                    .attr("stroke-width",4);
        }else if (ageing_branch.type == "lc"){
            d3.select("#p"+ageing_branch.id)
                .transition()
                    .duration(16000)
                    .attr("stroke","rgb(30, 50, 12)")
                    .attr("stroke-width",3);
        }else if (ageing_branch.type == "ld"){
            d3.select("#p"+ageing_branch.id)
                .transition()
                    .duration(16000)
                    .attr("stroke","rgb(70, 50, 12)")
                    .attr("stroke-width",3);
        }

    }
}

function randomIntFromInterval(min,max){
    
    return Math.floor(Math.random()*(max-min+1)+min);
}
