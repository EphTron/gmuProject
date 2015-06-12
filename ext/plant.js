            var mouse = {x: 0, y: 0};

            document.addEventListener('mousemove', function(e){ 
                mouse.x = e.pageX; 
                mouse.y = e.pageY;
            }, false);

            // constants
            var padding = 10

            // variables
            var w = window.innerWidth - padding;
            //varplugin_height= window.innerHeight- padding;
            var body = document.body,
                html = document.documentElement;

            var plugin_height= Math.max( body.scrollHeight, body.offsetHeight, 
                              html.clientHeight, html.scrollHeight, html.offsetHeight );
            var cols = 0;
            var rows = 0;
            var rect_width = 1;
            var rect_height = 1;
            var rect_count = 50;
            var grid_data_plugin = new Array();
            var point_id  = 0;
            var points = new Array();
            var rect_opacity = 0.2;
            var hotspot_list = new Array();

            // var gridContainer = d3.select("#gmuGrid")
            //     .append("svg")
            //     .attr("width", w)
            //     .attr("height", h);
            // var point_container = d3.select("#gmuGrid")
            //     .append("svg")
            //     .attr("width", w)
            //     .attr("height", h);

            var color_scale = d3.scale.linear()
                .domain([0,14])
                .range(["#111111","green"]);

            var grow_time_plugin = 1000;
            var max_angle = Math.PI/5;
            var branch_length = 30;
            var branch_queue_plugin = new Array();
            var plant_data_plugin = new Array();
            var branch_count_plugin = 0;
            var p_id = 0;
            var last_direction_plugin = { "x": 0,
                                   "y": 1}; 
            var last_angle = 0;
            var lattest_drawn_id = 0;
            var age_queue_plugin = new Array();
            var rankenContainer = d3.select("#gmuRanke")
                .append("svg")
                .attr("width", w)
                .attr("height", plugin_height)
                .attr("z-index", 100000000000)
                .attr("pointer-events", "none");

            // run
            init_grid(rect_count);
            run_time_growth();
            //run_hotspot_growth();
            //init_tendril();
            //grow_tendril(0,5);
            //run_click_growth();
            //run_time_growth();
            //init_grid();
            // code to get a rect under a spec
            // var _location_on_grid_x = Math.floor(location.x / data[0].width);
            // var _location_on_grid_y = Math.floor(location.y / data[0].height);
            // var _location_rect_id = (_location_on_grid_y) * cols + _location_on_grid_x;
            
            //track_cursor(1000);
            //draw_grid();

            // functions
            //init_point_container();

            //######## Init functions   ########

            function init_grid(r_count){
                cols = Math.round(Math.sqrt(r_count * (w/plugin_height)));
                rows = Math.round(r_count / cols);

                rect_width = w / cols; // calc width of rects
                rect_height =plugin_height/ rows; // calc height of rects

                var idx = 0;
                for(var r = 0; r < rows; r++){
                    for(var c = 0; c < cols ; c++){
                        grid_data_plugin[idx] = new Object();
                        grid_data_plugin[idx]["id"]      = idx;
                        grid_data_plugin[idx]["pos_x"]   = rect_width * c;
                        grid_data_plugin[idx]["pos_y"]   = rect_height * r;
                        grid_data_plugin[idx]["width"]   = rect_width;
                        grid_data_plugin[idx]["height"]  = rect_height;
                        grid_data_plugin[idx]["touched"] = 0;
                        idx++;
                    }
                }
            }

            function init_point_container(){

                point_container.on("click", function(d,i) {
                    var _p  = { "id": point_id,
                                "x": mouse.x,
                                "y": mouse.y };
                    points.push(_p);
                    var circle = point_container.append("circle")
                        .attr("id", _p.id)
                        .attr("cx", function (d) { return mouse.x; })
                        .attr("cy", function (d) { return mouse.y; })
                        .attr("r", 5)
                        .style("fill", "green");
                    point_id++;
                }); 
            }

            function init_test_tendril(point, point2){
                var a = Math.PI / 4
                var _alpha = -Math.PI/2;

                var _start = { "x":1, 
                               "y":0};

                var _omega = get_min_max_angle(_start, _alpha, point);

                var _middle = { "x": _start.x + branch_length * Math.cos(_omega),
                                "y": _start.y + branch_length * Math.sin(_omega)}; 

                _omega = get_min_max_angle(_middle, _omega, point2);

                var _end = { "x": _middle.x + branch_length * Math.cos(_omega), 
                             "y": _middle.y + branch_length * Math.sin(_omega)};
                var t = branch_length * Math.cos(_omega);
                
                last_direction_plugin = { "x": branch_length * Math.cos(_omega), 
                                   "y": branch_length * Math.sin(_omega)};

                var _root = new Array();
                _root.push(_start);
                _root.push(_middle);
                _root.push(_end);

                plant_data_plugin[p_id] = new Object();
                plant_data_plugin[p_id]["id"] = 0;
                plant_data_plugin[p_id]["branch"] = _root;
                plant_data_plugin[p_id]["angle"] = _omega;
                plant_data_plugin[p_id]["generation"] = 0;
                plant_data_plugin[p_id]["children"] = [];
                plant_data_plugin[p_id]["parent"] = -1;
                branch_count_plugin++;
                p_id++;

                branch_queue_plugin.push(0);
                draw_branches([0]);
            }

            function track_cursor(time){

                var last_p = {"x": 0,
                              "y": 0};
                setInterval(function(){
                    var _p  = {"x": mouse.x,
                               "y": mouse.y };
                    if(_p.x == last_p.x && _p.y == last_p.y){
                        console.log("same points");
                    }else{
                        points.push(_p);
                        create_hotspots(_p);
                    }
                    last_p = _p;
                    console.log(points);
                },time);
            }

            function create_hotspots(point){

                // calculate mouse position on an invisible grid
                var _on_grid_x = Math.floor(point.x / rect_width);
                var _on_grid_y = Math.floor(point.y / rect_height);
                var _rect_id   = _on_grid_y * cols + _on_grid_x;

                if (typeof grid_data_plugin[_rect_id] != 'undefined') {
                    grid_data_plugin[_rect_id].touched++;
                
                    if(hotspot_list.indexOf(grid_data_plugin[_rect_id]) == -1){
                        hotspot_list.push(grid_data_plugin[_rect_id]);
                    }

                    // sort list - front most touched - back less touched
                    hotspot_list.sort( function compare(a,b) {
                        if (a.touched > b.touched)
                            return -1;  
                        if (a.touched < b.touched)
                            return 1;
                        return 0;
                    });
                }
            }

            function get_random_angle_by_direction(plant_id, omega, new_dir){
                var _angle = 3*Math.PI/8;
                
                var result_angle = dot_product(normalize_vec(last_direction_plugin),normalize_vec(new_dir));
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
                last_direction_plugin = new_dir;

                
                return result_angle;
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
                //console.log("acos = ", result_angle);
                //console.log("cos  = ", Math.cos(result_angle));
                //console.log("tada = ", Math.acos(Math.cos(result_angle)));

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

            function run_click_growth() {
                setInterval(function(){ 
                    if (points.length > 1){
                        if(branch_queue_plugin.length == 0){
                            var _p = points.shift();
                            var _p2 = points.shift();
                            init_test_tendril(_p,_p2);
                        }
                        else{
                            idx = branch_queue_plugin.shift();
                            var _p = points.shift();
                            var _p2 = points.shift();
                            create_next_tendril(plant_data_plugin[idx], _p, _p2);
                            draw_branches(plant_data_plugin[idx].children, 100);
                        }
                        //create_test_tendril(plant_data_plugin[idx], _p)
                    }
                }, 100);
            }

            function run_time_growth() {
                var last_p = {"x": 0,
                              "y": 0};
                setInterval(function(){
                    var _p  = {"x": mouse.x,
                               "y": mouse.y };

                    points.push(_p);
                    last_p = _p
                    
                },500);

                setInterval(function(){ 
                    if (points.length > 1){
                        if(branch_queue_plugin.length == 0){
                            var _p = points.shift();
                            var _p2 = points.shift();
                            init_test_tendril(_p,_p2);
                        }
                        else{
                            idx = branch_queue_plugin.shift();
                            var _p = points.shift();
                            var _p2 = points.shift();
                            create_next_tendril_random_mouse(plant_data_plugin[idx],_p,_p2);
                            //create_next_tendril_based_on_mouse(plant_data_plugin[idx], _p, _p2);
                            draw_branches(plant_data_plugin[idx].children, 2000);
                        }
                    }
                    
                }, 2000);

                setInterval(function(){
                    if(age_queue_plugin.length > 2){
                        console.log("age_queue_plugin",age_queue_plugin.length)
                        //adjust_age(2);
                    }
                    
                },4000);
            }

            function run_hotspot_growth() {
                track_cursor(500);
                setTimeout(function(){
                    setInterval(function(){ 
                        if(branch_queue_plugin.length == 0){
                            var _p = points.shift();
                            var _p2 = points.shift();
                            init_test_tendril(_p,_p2);
                        }
                        else{
                            idx = branch_queue_plugin.shift();
                            create_next_tendril_based_on_hotspot(plant_data_plugin[idx]);
                            draw_branches(plant_data_plugin[idx].children, 1000);
                        }
                        
                        //create_test_tendril(plant_data_plugin[idx], _p)
                    }, 1000);
                }, 1000);
            }


            function create_next_tendril_random_mouse(object, point, point2){
                var new_child_id = p_id;
                
                object.children.push(new_child_id);
                //console.log("child id :",new_child_id);
                

                //new_child_id = object.children[0]
                plant_data_plugin[new_child_id] = new Object();

                var _max_angle = Math.PI/5;
                var _old_end = plant_data_plugin[object.id].branch[2];
                var _old_mid = plant_data_plugin[object.id].branch[1];
                var _old_omega = plant_data_plugin[object.id].angle;

                var _start = _old_end;

                var _middle = get_next_grow_point(new_child_id, _start, _old_omega, point, _max_angle);

                var _end = get_next_grow_point(new_child_id, _middle, last_angle, point2, _max_angle);
                
                var _branch = new Array();
                //_branch.push(_old_mid);
                _branch.push(_start);
                _branch.push(_middle);
                _branch.push(_end);
                //console.log("4", _branch );

                plant_data_plugin[new_child_id]["id"] = new_child_id;
                plant_data_plugin[new_child_id]["branch"] = _branch;
                plant_data_plugin[new_child_id]["angle"] = last_angle;
                plant_data_plugin[new_child_id]["wid"] = 6;
                plant_data_plugin[new_child_id]["generation"] = object.generation +1;
                plant_data_plugin[new_child_id]["children"] = [];
                plant_data_plugin[new_child_id]["parent"] = object.id;
                plant_data_plugin[new_child_id]["age"] = 0;

                branch_count_plugin++;
                p_id++;


                //create fancy leaves for a nice look

                var check_angle = Math.cos(last_angle);

                //console.log("CHECK ANGLE ", check_angle);
                if(check_angle <0.1){
                    var a = 0;
                    create_leaf(object, _branch, last_angle, "b");
                }else if(check_angle <0.3){
                    console.log("creating leaf")
                    create_leaf(object, _branch, last_angle, "b");
                }else if(check_angle >0.6){
                    console.log("creating leaf")
                    create_leaf(object, _branch, last_angle, "b");
                }else {
                    // _leaf.push("c");
                }

                branch_queue_plugin.push(new_child_id);
            }

            function create_leaf(object, branch, middle_angle, type){
                var new_leaf_id = p_id;
                //console.log("leaf id :",new_leaf_id);
                object.children.push(new_leaf_id);
                //new_child_id = object.children[0]
                plant_data_plugin[new_leaf_id] = new Object();

                var _old_end = branch[2];
                var _old_mid = plant_data_plugin[object.id].branch[1];
                var _old_omega = plant_data_plugin[object.id].angle;

                var _ran_point = {"x": randomIntFromInterval(0,w),
                                  "y": randomIntFromInterval(0,plugin_height)};
                var _start = get_next_grow_point(new_leaf_id, _old_mid, middle_angle, _ran_point, Math.PI/8);
                
                var _ran_point = {"x": randomIntFromInterval(0,w),
                                  "y": randomIntFromInterval(0,plugin_height)};
                var _middle = get_next_grow_point(new_leaf_id, _start, last_angle, _ran_point, Math.PI/5);

                _ran_point = {"x": randomIntFromInterval(0,w),
                              "y": randomIntFromInterval(0,plugin_height)};
                var _end = get_next_grow_point(new_leaf_id, _middle, last_angle, _ran_point, Math.PI/4);
                
                var _branch = new Array();
                _branch.push(_old_mid);
                _branch.push(_start);
                _branch.push(_middle);
                _branch.push(_end);
                //console.log("brraaaa", _branch );

                plant_data_plugin[new_leaf_id]["id"] = new_leaf_id;
                plant_data_plugin[new_leaf_id]["branch"] = _branch;
                plant_data_plugin[new_leaf_id]["angle"] = last_angle;
                plant_data_plugin[new_leaf_id]["wid"] = 4;
                plant_data_plugin[new_leaf_id]["generation"] = object.generation +1;
                plant_data_plugin[new_leaf_id]["children"] = [];
                plant_data_plugin[new_leaf_id]["parent"] = object.id;
                plant_data_plugin[new_leaf_id]["age"] = 0;
                branch_count_plugin++;
                p_id++;

                //branch_queue_plugin.push(new_leaf_id);
            }

            function create_next_tendril_based_on_hotspot(object){
                new_child_id = object.children[0]
                plant_data_plugin[new_child_id] = new Object();
                
                var _old_end = plant_data_plugin[object.id].branch[2];
                var _old_mid = plant_data_plugin[object.id].branch[1];
                var _old_omega = plant_data_plugin[object.id].angle;

                var _start = _old_end;

                var _hotspot_point = find_closest_hotspot(_start, 10);
                if (_hotspot_point.x == 0 && _hotspot_point.y == 0){
                    console.log("finding hottest point")
                    _end = find_hottest_hotspot(_start);
                    if (_hotspot_point.x == 0 && _hotspot_point.y == 0){
                        _hotspot_point = {"x": _start.x + branch_length * Math.cos(_old_omega),
                                          "y": _start.y + branch_length * Math.sin(_old_omega)};
                        console.log("random point", _hotspot_point);
                    }
                }

                var _omega = get_min_max_angle(_start, _old_omega, _hotspot_point);
                //console.log("1",_omega)
                var _middle = { "x": _start.x + branch_length * Math.cos(_omega), //+ (Math.random() * 200) - 100,
                                "y": _start.y + branch_length * Math.sin(_omega)}; 

                // 
                //var _hotspot_point = find_hottest_hotspot(_start);
                var _hotspot_point2 = find_closest_hotspot(_start, 10);
                if (_hotspot_point2.x == 0 && _hotspot_point2.y == 0){
                    console.log("finding hottest point")
                    _end = find_hottest_hotspot(_start);
                    if (_hotspot_point2.x == 0 && _hotspot_point2.y == 0){
                        console.log("random point");
                        _hotspot_point2 = {"x": _middle.x + branch_length * Math.cos(_omega),
                                           "y": _middle.y + branch_length * Math.sin(_omega)};
                        console.log("random point", _hotspot_point2);
                    }
                }

                _omega = get_min_max_angle(_middle, _omega, _hotspot_point2);
                //console.log("2",_omega)
                //console.log("2")
                var _end = {"x": _middle.x + branch_length * Math.cos(_omega),
                            "y": _middle.y + branch_length * Math.sin(_omega)};

                
                var _branch = new Array();
                //_branch.push(_old_mid);
                _branch.push(_start);
                _branch.push(_middle);
                _branch.push(_end);
                //console.log("4", _branch );

                plant_data_plugin[new_child_id]["id"] = new_child_id;
                plant_data_plugin[new_child_id]["branch"] = _branch;
                plant_data_plugin[new_child_id]["angle"] = _omega;
                plant_data_plugin[new_child_id]["generation"] = object.generation +1;
                plant_data_plugin[new_child_id]["children"] = [p_id];
                plant_data_plugin[new_child_id]["parent"] = object.id;
                branch_count_plugin++;

                branch_queue_plugin.push(new_child_id);
            }

            function dot_product(a, b){

                var result = a.x * b.x + a.y * b.y
                //console.log("dot a:",a,"dot b",b);
                return result
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
                    .data(grid_data_plugin)
                    .enter()
                    .append("rect");

                rectGrid.attr("id", function(d,i){return "r"+i;})
                    .attr("x", function(d,i){return grid_data_plugin[i].pos_x})
                    .attr("y", function(d,i){return grid_data_plugin[i].pos_y})
                    .attr("width", function(d,i){return grid_data_plugin[i].width})
                    .attr("height", function(d,i){return grid_data_plugin[i].height})
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


            function normalize_vec(a){
                //console.log("norm a",a);
                _a_length = Math.sqrt((a.x) * (a.x) + (a.y) * (a.y));

                 a.x = (a.x) / _a_length;
                 a.y = (a.y) / _a_length;

                return a;
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

            function find_hotspot(location, candidates){
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
                            // console.log("too close")
                        }
                        else if (_vec_length < _shortest_distance){
                            _closest_spot = hotspot_list[i];
                            _shortest_distance = _vec_length;
                        }
                    }
                    // console.log(_closest_spot);
                    // delete hotspot
                    if (_closest_spot != null){
                        remove_id = hotspot_list.indexOf(_closest_spot);
                        //hotspot_list[remove_id].touched -= 2;
                        //if (hotspot_list[remove_id].touched <= 0 ){
                            hotspot_list.splice(remove_id, 1);
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
                            // console.log("too close")
                        }
                        else if (_vec_length < _shortest_distance){
                            _closest_spot = hotspot_list[i];
                            _shortest_distance = _vec_length;
                        }
                    }
                    // console.log(_closest_spot);
                    // delete hotspot
                    if (_closest_spot != null){
                        remove_id = hotspot_list.indexOf(_closest_spot);
                        //hotspot_list[remove_id].touched -= 2;
                        //if (hotspot_list[remove_id].touched <= 0 ){
                            hotspot_list.splice(remove_id, 1);
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
                var _to_draw = branch_list.length;
                //console.log("Branchlist: ",branch_list)
                for (var i = 0; i < _to_draw; i++){
                    idx = branch_list.shift();
                    var lineFunction = d3.svg.line()
                        .x(function(d) { return d.x; })
                        .y(function(d) { return d.y; })
                        .interpolate("cardinal");
                        //bundle
                        //monotone
                        //cubic

                    var plantGraph = rankenContainer.append("path")
                        .attr("d", lineFunction(plant_data_plugin[idx].branch))
                        .attr("id", "p"+plant_data_plugin[idx].id)
                        .attr("stroke", "green")
                        .attr("pointer-events","stroke")
                        .attr("stroke-width", plant_data_plugin[idx].wid) //- (plant_data_plugin[idx].generation) * 0.4)
                        .attr("fill", "none")
                        .on("mouseover",  function(d,i) {
                            // console.log("testetsestset")
                    });

                    var plant_length = plantGraph.node().getTotalLength();

                    plantGraph.attr("stroke-dasharray", plant_length + " " + plant_length)
                        .attr("stroke-dashoffset", plant_length)
                        .transition()
                            //.delay(plant_data_plugin[idx].generation * 3000)
                            .duration(time)
                            .ease("linear")
                            .attr("stroke-dashoffset", 0);
                    age_queue_plugin.push(idx);

                }
                while (plant_data_plugin[age_queue_plugin[0]].generation <= plant_data_plugin[idx].generation -5){
                    i = age_queue_plugin.shift();
                    console.log("poped", i);
                }
            }


            function randomIntFromInterval(min,max){
                
                return Math.floor(Math.random()*(max-min+1)+min);
            }

            function get_angle_between_abc(a,b,c){

                var _vec1 = { "x": a.x - b.x,
                              "y": a.y - b.y};
                var _vec2 = { "x": a.x - c.x, 
                              "y": a.y - c.y};

                result_angle = dot_product(normalize_vec(_vec1),normalize_vec(_vec2));

                return Math.acos(result_angle);

            }

            function get_next_grow_point(id, start, old_angle, new_point, max_angle){
                //var _max_angle = Math.PI/5;
                var _omega = get_min_max_angle(start, old_angle, new_point, max_angle);

                var _dir = { "x": branch_length * Math.cos(_omega), //+ (Math.random() * 200) - 100,
                             "y": branch_length * Math.sin(_omega)}; 
                
                var _beta = get_random_angle_by_direction(id, _omega, _dir);
                
                _omega = (_omega + (_omega + _beta))/2;

                var _step_end = { "x": Math.floor(start.x + branch_length * Math.cos(_omega)), //+ (Math.random() * 200) - 100,
                                  "y": Math.floor(start.y + branch_length * Math.sin(_omega))};
                //set the direction of middle as last_direction_plugin
                last_direction_plugin = {"x": branch_length * Math.cos(_omega),
                                  "y": branch_length * Math.sin(_omega)};
                
                // last_angle = get_angle_between_abc(start,_temp_beta,_temp_omega);
                last_angle = _omega;

                return _step_end;
            }

            function adjust_age(age_steps){
                for (idx in age_queue_plugin){
                    ageing_branch = plant_data_plugin[age_queue_plugin[idx]];

                    if (ageing_branch.age <= age_steps){
                        console.log(ageing_branch.id)
                        d3.select("#p"+ageing_branch.id)
                            .transition()
                                .duration(100000)
                                .attr("stroke","#043302")
                                .attr("stroke-width",7);
                    }
                }
            }
