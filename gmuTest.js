<!DOCTYPE html>
<html>
  <head>
      <title>Visu Beleg</title>
      <link rel="stylesheet" href="indexstyle.css">
      <script type="text/javascript" src="d3/d3.v3.js"></script>
      <script type="text/javascript" src="jQuery/jquery-2.1.1.min.js"></script>
      <!-- <script type="text/javascript" src="http://code.jquery.com/jquery-1.9.1.js"></script> -->

      <meta charset="UTF-8">
  </head>
  <body>
    <div class="wrapper">
      <div class="main">
      </div>
    </div>

    <script type="text/javascript">

      var w = window.innerWidth;
      var h = window.innerHeight;

      

      function setup(data) {

        // --- HORIZONTAL - BARCHART ------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //
        var barSVGh = d3.select(".horizontalChart")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h+10);

        var hBars = barSVGh.selectAll("rect")
                         .data(data)
                         .enter()
                         .append("rect");

        var pointer = barSVGh.append("polygon");

        var textBox = d3.select(".smartComments")
                        .select(".textBox")

        var colorScale = d3.scale.linear()
                           .domain([minHelpAvg,0,maxHelpAvg])
                           .range(["#D37575","lightgray","green"]);

        // --- BUTTONS --------------------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //
        var buttArray = [{id:0 ,state:"sort by: helpful", value:1},
                         {id:1 ,state:"sort by: date",  value:2},
                         {id:2 ,state:"sort by: stars",   value:3},
                         {id:3 ,state:"sort by: review length", value:4},
                         {id:4 ,state:"none",    value:5}];

        var buttonSVG = d3.select(".sortButtons")
                          .append("svg")
                          .attr("width", w)
                          .attr("height", 30);

        var buttons = buttonSVG.selectAll("rect")
                               .data(buttArray)
                               .enter()
                               .append("rect");

        var labels = buttonSVG.selectAll("text")
                              .data(buttArray)
                              .enter()
                              .append("text");

        // --- MARKER ---------------------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //
        var marker = buttonSVG.selectAll("polygon")
                              .data(buttArray)
                              .enter()
                              .append("polygon");

        // --- VERTICAL - BARCHART --------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = window.innerWidth - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom;

        var barSVGv = d3.select(".barChart")
                        .append("svg")
                        .attr("class", "barSVGv")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", 0)
                        // .attr("height", 50+ height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate("+ margin.left + "," + margin.top + ")");


        var vBars = barSVGv.selectAll("rect")
                         .data(data)
                         .enter()
                         .append("rect"); 

        var xScale = d3.scale.ordinal()
                       .rangeRoundBands([0, width], .1);
        
        // var minDate = d3.min(sortArray,function(d) { return d.date });
        // var maxDate = d3.max(sortArray,function(d) { return d.date });
        // var xScale = d3.time.scale().domain([minDate,maxDate]).range([0,width]);

        var yScale = d3.scale.linear()
                       .range([height, 0]);

        var xAxis = d3.svg.axis()
                          .scale(xScale)
                          .orient("bottom");

        var yAxis = d3.svg.axis()
                          .scale(yScale)
                          .orient("left")
                          .ticks(6);

        // --- TIMELINE - TOGGLE ----------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //
        var timelineSVG = d3.select(".timeline")
                            .append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", 20);
        
        var timelineButton = timelineSVG.append("rect");
        var timelineMarker = timelineSVG.append("path");
        var timelineLabel  = timelineSVG.append("text");

        // --- RETURN VALUES --------------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //
        var values = [buttonSVG,barSVGh,hBars,buttons,labels,
                      buttArray,marker,textBox,colorScale,
                      pointer,barSVGv,xScale,yScale,vBars,
                      xAxis,yAxis,margin,width,height,
                      timelineSVG,timelineButton,timelineMarker,
                      timelineLabel];
        
        return values;
      }

      function draw(data,posArray,setupData,sortArray) {

        var buttonSVG = setupData[0];
        var barSVGh   = setupData[1];
        var hBars     = setupData[2];
        var buttons   = setupData[3];
        var labels    = setupData[4];
        var buttArray = setupData[5];
        var marker    = setupData[6];
        var textBox   = setupData[7];
        var colScl    = setupData[8];
        var pointer   = setupData[9];
        var barSVGv   = setupData[10];
        var xScale    = setupData[11];
        var yScale    = setupData[12];
        var vBars     = setupData[13];
        var xAxis     = setupData[14];
        var yAxis     = setupData[15];
        var margin    = setupData[16];
        var width     = setupData[17];
        var height    = setupData[18];
        var timelineSVG    = setupData[19];
        var timelineButton = setupData[20];
        var timelineMarker = setupData[21];
        var timelineLabel  = setupData[22];

        var bCnt = buttArray.length; // buttonCount
        
        // --- POINTER --------------------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //
        pointer.attr("id", "p")
               .style("fill", "white")
               .style("stroke", "white");

        // --- TOGGLE - TIMELINE ----------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //
        timelineLabel.attr("x", 50)
                     .attr("y", 15)
                     .text("show timeline");

        timelineMarker.attr("d", "M "+(width/2-20)+",5 L "+(width/2)+",15 L "+(width/2+20)+",5")
                      .style("fill", "lightgrey")
                      .style("stroke", "#6E6E6E")
                      .style("stroke-width", 2)                     

        timelineButton.attr("x", 20)
                      .attr("y", 0)
                      .attr("width", width+20)
                      .attr("height", 20)
                      .attr("fill", "lightgrey")
                      .attr("stroke", "lightgrey")
                      .on("mouseover", function() {
                        timelineButton.transition().duration(200)
                                      .attr("fill", "#66CCFF");
                        timelineMarker.transition().duration(200)
                                      .style("fill", "#66CCFF");
                       })
                      .on("mouseout", function() { 
                        timelineButton.transition().duration(200)
                                      .attr("fill", "lightgrey");
                        timelineMarker.transition().duration(200)
                                      .style("fill", "lightgrey");                                      
                       })
                      .on("click", function() {
                        timelineToggle += 1;
                        if(timelineToggle%2 == 0){
                          d3.select(".barSVGv")
                            .transition()
                            .duration(300)
                            .style("height", 0);
                          timelineLabel.text("show timeline"); 
                          timelineMarker.attr("d", "M "+(width/2-20)+",5 L "+(width/2)+",15 L "+(width/2+20)+",5")                         
                        } else {
                          d3.select(".barSVGv")
                            .transition()
                            .duration(300)
                            .style("height", 150);
                          timelineLabel.text("hide timeline");
                          timelineMarker.attr("d", "M "+(width/2-20)+",15 L "+(width/2)+",5 L "+(width/2+20)+",15")
                        }
                       });        

        // --- VERTICAL - BARCHART --------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //
        xScale.domain(sortArray.map(function(d,i) { return sortArray[i].id; }));
        yScale.domain([0, d3.max(data, function(d,i) { return sortArray[i].stars; })]);

        barSVGv.append("g")
               .attr("class", "x axis foo")
               .attr("transform", "translate(0," + height + ")")
               .call(xAxis)
               .selectAll("text")
               .attr("dx", "-.8em")
               .attr("dy", ".15em")
               .style("text-anchor", "end")
               .attr("transform", function(d) { return "rotate(-45)" })
               .text(function(d,i) { return sortArray[i].dateLabel });

        barSVGv.append("g")
               .attr("class", "y axis")
               .call(yAxis)
               .append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", 6)
               .attr("dy", ".71em")
               .style("text-anchor", "end")
               .text("Stars");

        vBars.attr("id", function(d,i) { return "b"+sortArray[i].id })
              .attr("x", function(d,i) {
                 return xScale(sortArray[i].id);
               })
              .attr("width", xScale.rangeBand())
              .attr("y", function(d,i) { return yScale(sortArray[i].stars); })
              .attr("height", function(d,i) { return height - yScale(sortArray[i].stars); })
              .attr("fill", "lightgrey")
              .on("mouseover", function(d,i) {
                barSVGv.select("#b"+i).attr("fill", "#66CCFF");
                barSVGh.select("#r"+i).attr("fill", "#66CCFF");
               })
              .on("mouseout", function(d,i) { 
                barSVGv.select("#b"+i).attr("fill", "lightgrey");
                barSVGh.select("#r"+i).attr("fill", colScl(d.helpAvg));
               })
              .on("click", function(d,i) { 
                sortmode += 1;
                sortTimeline(sortArray,barSVGv,sortmode,xScale,width,height,xAxis);
               });
    
        // --- HORIZONTAL - BARCHART ------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //
        hBars.attr("id", function(d,i) { return "r" + i; })
            .attr("x", function(d,i) { return posArray[i].x })
            .attr("y", function(d,i) { return ((h - posArray[i].height) / 2) })
            .attr("width", function(d,i) { return posArray[i].width })
            .attr("height", function(d,i) { return posArray[i].height })
            .attr("stroke", "white")
            .attr("fill", function(d) {return colScl(d.helpAvg);})
            .on("mouseover",  function(d,i) {
              if(showPara != 2){
                if (showPara == 3){
                barSVGh.select("#r"+parseInt(activeId))
                   .transition()
                   .duration(100)
                   .attr("fill", colScl(dataset[activeId].helpAvg));
                }
                showPara = 1;
                activeId = d.id;
              
                var rectX = findByID(posArray,i).x;
                var width = findByID(posArray,i).width;
                var x1 = parseFloat(rectX)+parseFloat(width/2);
                showInfo(textBox,rectX);
                
                barSVGh.select("#r"+parseInt(d.id))
                    .transition()
                    .duration(100)
                    .attr("fill", "#66CCFF");

                barSVGh.select("#p")
                      .transition()
                      .duration(100)
                      .style("fill", "#66CCFF")
                      .style("stroke", "#66CCFF")
                      .attr("points",(x1+","+50+","+(x1-10)+","+60+","+(x1+10)+","+60) );
                      
                barSVGv.select("#b"+i)
                     .transition()
                     .duration(150)
                     .style("fill","#66CCFF");
                     
                drawAnswers(answerSet,d.id);
              }
            })
            .on("mouseout",function (d,i) {
              if(showPara != 2){
                barSVGh.select("#r"+parseInt(d.id))
                   .transition()
                   .duration(100)
                   .attr("fill", colScl(d.helpAvg));
                barSVGh.select("#p")
                      .transition()
                      .duration(50)
                      .style("fill", "white")
                      .style("stroke", "white");
                barSVGv.select("#b"+i)
                     .transition()
                     .duration(150)
                     .style("fill","lightgrey");
                showPara = 0;
                activeId = d.id;
                showInfo(textBox);
                d3.select(".answerChart").select("svg").remove();
              }
            })
            .on("click", function (d) {
              if (showPara == 1 || showPara == 0){
                d3.select(".answerChart").select("svg").remove();
                showPara = 2;
                activeId = d.id;
                console.log("clicked ->"+ showPara);
                drawAnswers(answerSet,d.id);
              } else if (showPara == 2){
                barSVGh.select("#r"+parseInt(activeId))
                 .transition()
                 .duration(100)
                 .attr("fill", colScl(dataset[activeId].helpAvg));

                showPara = 1;
                activeId = d.id;;
                console.log("clicked again ..."+showPara);
                
                var rectX = findByID(posArray,activeId).x;

                showInfo(textBox,rectX);
                barSVGh.select("#r"+parseInt(d.id))
                  .transition()
                  .duration(100)
                  .attr("fill", "#66CCFF");

                var width = findByID(posArray,activeId).width;
                var x1 = parseFloat(rectX) + parseFloat(width/2);
                barSVGh.select("#p")
                      .transition()
                      .duration(100)
                      .style("fill", "#66CCFF")
                      .style("stroke", "#66CCFF")
                      .attr("points",(x1+","+50+","+(x1-10)+","+60+","+(x1+10)+","+60) );
                d3.select(".answerChart").select("svg").remove();
                d3.select(".answerBox").style("display", "none");
                aShowPara = 0;
              }
            });
        //set  position and color of marker and activeId rect on FIRST VISIT
        
        firstVisitInit(textBox);
        
        // --- BUTTONS --------------------------------------------------------------------------- //
        // --------------------------------------------------------------------------------------- //

        buttons.attr("id", function(d,i) { return "b"+i; })
               .attr("active", false)
               .attr("x", function(d,i) { return i*(w/bCnt); })
               .attr("y", 0)
               .attr("width", function(d,i) { return (w/bCnt)-20; })
               .attr("height", 25)
               .attr("rx", 6)
               .attr("ry", 6)
               .attr("stroke", "black")
               .attr("fill", "lightgrey")
               .on("mouseover", function(d){
                  buttonSVG.select("#b"+parseInt(d.id))
                    .transition()
                    .duration(100)
                    .attr("fill", "lightblue");
                })
               .on("mouseout", function(d){
                  buttonSVG.select("#b"+parseInt(d.id))
                    .transition()
                    .duration(100)
                    .attr("fill", "lightgrey");
                })
               .on("click", function(d) {
                  activeButton = d.value;
                  buttonSVG.select("#b"+parseInt(d.id))
                    .transition()
                    .duration(100)
                    .attr("fill", "red");
                  clicked = clicked*-1;
                  var buttonState = clicked*d.value;
                  sortBars(posArray,barSVGh,buttonState,textBox,1000);
                  changeMarkerState(buttonSVG,marker,buttonState,d.id);
                });

        labels.attr("id", function(d,i) { return "l"; })
              .text(function(d,i) { return buttArray[i].state; })
              .attr("x", function(d,i) { return i*(w/bCnt) + ((w/bCnt)/2-10);  })
              .attr("y", 18)
              .attr("width", function(d,i) { return (w/bCnt)-20; })
              .attr("height", 20)
              .attr("text-anchor", "middle");

        marker.attr("id", function(d,i) { return "m"+i; })
              .style("stroke", "black")
              .style("fill", "black")
              .attr("points", function(d,i) {
                  return ((i*(w/bCnt)+(w/bCnt)-40)+","+8+","+
                          (i*(w/bCnt)+(w/bCnt)-40)+","+18+","+
                          (i*(w/bCnt)+(w/bCnt)-30)+","+13);
              });
        sortBars(posArray,barSVGh,-3,textBox,0);
      }

      function showInfo(textBox,rectX){
                
        if (showPara == 1 || showPara == 3){
          d3.select(".textBox")
            .style("display", "block");
          d3.select(".textBox")
            .select(".textStars")
            .text("Stars:" + dataset[activeId].rating);
          d3.select(".textBox")
            .select(".textNr")
            .text("Nr.:" + dataset[activeId].id + "  Date:" + dataset[activeId].date);
          d3.select(".textBox")
            .select(".textTitle")
            .text(dataset[activeId].infoTitle);
          d3.select(".textBox")
            .select(".textInfo")
            .text(dataset[activeId].infoText);
          d3.select(".textBox")
            .select(".textHelp")
            .text(dataset[activeId].helpPos + " out of " +dataset[activeId].helpAll + " found this Review helpful.");
          if (showPara != 2) {
            textStyle(textBox,rectX,250);
          }
        }
        else if(showPara == 0){
          d3.select(".textBox")
            .style("display", "none");
          d3.select(".textBox")
            .select(".textNr")
            .text("");
          d3.select(".textBox")
            .select(".textInfo")
            .text("");
        }
      }

      function textStyle(textBox,rectX,delay) {
        if(rectX < 400) {
          textBox.transition()
            .duration(delay)
            .style("margin-left", 17+"px");
        } else if (rectX > (w-400)) {
         textBox.transition()
            .duration(delay)
            .style("margin-left", (w-800+7)+"px");
        } else {
          textBox.transition()
            .duration(delay)
            .style("margin-left", (rectX-400+17)+"px");
        }
      };
      
      function answerStyle(textBox,rectX,delay) {
        if(rectX < 200) {
          textBox.transition()
            .duration(delay)
            .style("margin-left", 0+"px");
        } else if (rectX > 600) {
         textBox.transition()
            .duration(delay)
            .style("margin-left", (400- 8)+"px");
        } else {
          textBox.transition()
            .duration(delay)
            .style("margin-left", (rectX-130)+"px");
        }
      };
      
      function drawAnswers(answerSet,id){
        //setup the right answers
        var subSet = [];
        answerSet.forEach(function(d,i) {
          if (d.ref == id){
            subSet.push(d);
          }
        });
        if (subSet.length > 0){
          subSet.forEach(function(d,i) {
            d["id"] = i;
          });
      
          //setup sizes and colors
          var aW = (780/subSet.length);
          console.log(subSet);
          
          // draw
          var answerBox = d3.select(".smartComments")
                            .select(".textBox")
                            .select(".answerBox");
          
          var answerSVG = d3.select(".answerChart")
                      .append("svg")
                      .attr("width", 780)
                      .attr("height", 60);

          var answers = answerSVG.selectAll("rect")
                           .data(subSet)
                           .enter()
                           .append("rect");

          var ansPointer = answerSVG.append("polygon")
          
          ansPointer.attr("id", "aP")
                    .style("fill", "white")
                    .style("stroke", "white");
          
          answers.attr("id", function(d,i) { return "aR" + i; })
            .attr("x", function(d,i) { return aW*i })
            .attr("y", 0)
            .attr("width", function(d,i) { return aW })
            .attr("height", h)
            .attr("stroke", "white")
            .attr("fill", "lightgrey")
            .on("mouseover",  function(d,i) {
              if(aShowPara != 2){
                aShowPara = 1;
                activeAId = d.id;
                var rectX = aW*i;
                var x1 = parseFloat(rectX)+parseFloat(aW/2);
                showAnswer(subSet,answerBox,rectX);
                console.log("AR = " + parseInt(d.id));
                answerSVG.select("#aR"+parseInt(d.id))
                    .transition()
                    .duration(100)
                    .attr("fill", "#66CCFF");

                answerSVG.select("#aP")
                      .transition()
                      .duration(100)
                      .style("fill", "#66CCFF")
                      .style("stroke", "#66CCFF")
                      .attr("points",(x1+","+50+","+(x1-10)+","+60+","+(x1+10)+","+60) );
              }
            })
            .on("mouseout",function (d) {
              if(aShowPara != 2){
                
                answerSVG.select("#aR"+parseInt(d.id))
                   .transition()
                   .duration(100)
                   .attr("fill", "lightgray");
                answerSVG.select("#aP")
                      .transition()
                      .duration(50)
                      .style("fill", "white")
                      .style("stroke", "white");
                aShowPara = 0;
                activeAId = d.id;
                showAnswer(subSet,answerBox);
              }
            })
            .on("click", function (d) {
              if (aShowPara == 1 || aShowPara == 0){
                aShowPara = 2;
                activeAId = d.id;
                console.log("clicked ->"+ aShowPara);
              } else if (aShowPara == 2){
                answerSVG.select("#aR"+parseInt(activeAId))
                 .transition()
                 .duration(100)
                 .attr("fill", "lightgray");
                 //.attr("fill", colScl(subSet[activeAId].helpAvg));

                aShowPara = 1;
                activeAId = d.id;;
                console.log("clicked again ..."+aShowPara);
                
                var rectX = aW*d.id;
                showAnswer(subSet,answerBox,rectX);
                answerSVG.select("#aR"+parseInt(d.id))
                  .transition()
                  .duration(100)
                  .attr("fill", "#66CCFF");

                var x1 = parseFloat(rectX) + parseFloat(aW/2);
                answerSVG.select("#aP")
                  .transition()
                  .duration(100)
                  .style("fill", "#66CCFF")
                  .style("stroke", "#66CCFF")
                  .attr("points",(x1+","+50+","+(x1-10)+","+60+","+(x1+10)+","+60) );
                
              }
            });
        }
      }
      
      function showAnswer(subSet,textHandle,rectX){
        if (aShowPara == 1){
          d3.select(".answerBox")
            .style("display", "block");
          d3.select(".answerBox")
            .select(".aTextNr")
            .text("Nr.:" + subSet[activeAId].id);
          d3.select(".answerBox")
            .select(".aTextInfo")
            .text("Says:" + subSet[activeAId].infoText);
          if (aShowPara != 2) {
            answerStyle(textHandle,rectX,250);
          }
        }
        else if(aShowPara == 0){
          d3.select(".answerBox")
            .style("display", "none");
          d3.select(".answerBox")
            .select(".aTextNr")
            .text("");
          d3.select(".answerBox")
            .select(".aTextInfo")
            .text("");
        }
      }

      function calcHeight(length) {
        if(length < 300)
          return 30;
        else if (length > 300 && length < 600)
          return 40;
        else
          return 50;
      }

      function mapToScreen(val) {
        var m = d3.scale.linear()
								  .domain([0,totalWidth])
								  .range([1,w-correct]);
        return m(mapTo(val));
      }

      function mapTo(val) {
        var s = d3.scale.linear()
                  .domain([minHelpAvg,maxHelpAvg])
                  .range([1,10]);
        return s(val);
      }

      function sortBars(posArray,svg,buttonState,textBox,delay) {
        curWidth = 0;

        if(buttonState == 1) { //sort by helpful ascending
          posArray.sort(function(a,b) { return a.width - b.width; });
        } else if(buttonState == -1){ //descending
          posArray.sort(function(a,b) { return b.width - a.width; });
        } else if(buttonState == 2) { //sort by date ascending
          posArray.sort(function(a,b) { return a.date - b.date; });
        } else if(buttonState == -2) { // descending
          posArray.sort(function(a,b) { return b.date - a.date; });
        } else if (buttonState == 3) { //sort by stars ascending
          posArray.sort(function(a,b) { return a.stars - b.stars; });
        } else if (buttonState == -3) { // descending
          posArray.sort(function(a,b) { return b.stars - a.stars; });
        } else if (buttonState == 4) {  // sort by ascending review length
          posArray.sort(function(a,b) { return a.length - b.length; });
        } else if (buttonState == -4) { // descending
          posArray.sort(function(a,b) { return b.length - a.length; });
        }

        posArray.forEach(function(d,i) {
          var w_tmp = posArray[i].width;
          posArray[i].x = curWidth;
          curWidth += w_tmp;
          svg.select("#r"+(posArray[i].id))
             .transition()
             .duration(delay)
             .attr("x", function(d) {
                return posArray[i].x;
              });
        });
        showSortLegend(posArray,activeButton,buttonState);
        var rectX = findByID(posArray,activeId).x;
        var width = findByID(posArray,activeId).width;
        var x1 = parseFloat(rectX) + parseFloat(width/2);
        // console.log("x = " + x1);
        if(showPara == 2 || showPara == 3){
          svg.select("#p")
              .transition()
              .duration(delay)
              .style("fill", "#66CCFF")
              .style("stroke", "#66CCFF")
              .attr("points",(x1+","+50+","+(x1-10)+","+60+","+(x1+10)+","+60) );
        }
        textStyle(textBox,rectX,delay);
      }
      
      function showSortLegend(posArray,activeButton,buttonState){
        d3.select(".sortLegend").select("svg").remove();
        var partArray = [0,0,0,0,0];
        posArray.forEach(function(d,i) {
          if(posArray[i].rating == 5){
            partArray[0] += posArray[i].width;
          } else if (posArray[i].rating == 4){
            partArray[1] += posArray[i].width;
          } else if (posArray[i].rating == 3){
            partArray[2] += posArray[i].width;
          } else if (posArray[i].rating == 2){
            partArray[3] += posArray[i].width;
          } else if (posArray[i].rating == 1){
            partArray[4] += posArray[i].width;
          }
        });
        var legend = d3.select(".sortLegend")
          .append("svg")
          .attr("width", w)
          .attr("height", 18);
        //refresh buttons
        d3.select(".sortButtons")
            .selectAll("rect")
            .style("fill","lightgray")
            .style("stroke", "black");
            
        //mark selected button and show legend
        if (buttonState == -1){
          partArray = [50,w-100];
          d3.select(".sortButtons")
            .select("#b" + (activeButton-1))
            .style("fill","#66CCFF")
            .style("stroke", "darkblue");
          legend.selectAll("image").data(partArray).enter().append("svg:image")
            .attr("id", function(d,i) { return "help" + i; })
            .attr("x", function(d,i) { return partArray[i] })
            .attr("y", 0)
            .attr("width", 50 )
            .attr("height", 20)
            .style("stroke", "black")
            .attr("xlink:href",function(d,i){return "./pictures/"+i+"help.png"});
        }else if (buttonState == 1){
          partArray = [w-100,50];
          d3.select(".sortButtons")
            .select("#b" + (activeButton-1))
            .style("fill","#66CCFF")
            .style("stroke", "darkblue");
          legend.selectAll("image").data(partArray).enter().append("svg:image")
            .attr("id", function(d,i) { return "help" + i; })
            .attr("x", function(d,i) { return partArray[i] })
            .attr("y", 0)
            .attr("width", 50 )
            .attr("height", 20)
            .style("stroke", "black")
            .attr("xlink:href",function(d,i){return "./pictures/"+i+"help.png"});
        } else if (buttonState == 2){
          d3.select(".sortButtons")
            .select("#b" + (activeButton-1))
            .style("fill","#66CCFF")
            .style("stroke", "darkblue");
        } else if (buttonState == -2){
          d3.select(".sortButtons")
            .select("#b" + (activeButton-1))
            .style("fill","#66CCFF")
            .style("stroke", "darkblue");
        } else if (buttonState == 3){
          partArray.reverse();
          d3.select(".sortButtons")
            .select("#b" + (activeButton-1))
            .style("fill","#66CCFF")
            .style("stroke", "darkblue");
          legend.selectAll("rect").data(partArray).enter().append("rect")
            .attr("id", function(d,i) { return "rLeg" + i; })
            .attr("x", function(d,i) { return legendX(partArray,i) })
            .attr("y", -1)
            .attr("width", function(d,i) { return (partArray[i]-1)})
            .attr("height", 20)
            .style("stroke", "black")
            .style("fill","white");
          legend.selectAll("image").data(partArray).enter().append("svg:image")
            .attr("id", function(d,i) { return "pLeg" + i; })
            .attr("x", function(d,i) { return legendX(partArray,i) })
            .attr("y", 0)
            .attr("width", function(d,i) { return (partArray[i])})
            .attr("height", 14)
            .style("stroke", "black")
            .attr("xlink:href",function(d,i){return "./pictures/"+(4-i)+"stars.png"});
        } else if (buttonState == -3){
          d3.select(".sortButtons")
            .select("#b" + (activeButton-1))
            .style("fill","#66CCFF")
            .style("stroke", "darkblue");
          legend.selectAll("rect").data(partArray).enter().append("rect")
            .attr("id", function(d,i) { return "rLeg" + i; })
            .attr("x", function(d,i) { return legendX(partArray,i) })
            .attr("y", -1)
            .attr("width", function(d,i) { return (partArray[i]-1)})
            .attr("height", 20)
            .style("stroke", "black")
            .style("fill","white");
          legend.selectAll("image").data(partArray).enter().append("svg:image")
            .attr("id", function(d,i) { return "pLeg" + i; })
            .attr("x", function(d,i) { return legendX(partArray,i) })
            .attr("y", 0)
            .attr("width", function(d,i) { return (partArray[i])})
            .attr("height", 14)
            .style("stroke", "black")
            .attr("xlink:href",function(d,i){return "./pictures/"+i +"stars.png"} );
        }  
      }

      function sortTimeline(sortArray,svg,sortmode,xScale,width,height,xAxis) {

        if(sortmode%4 == 0) {
          sortArray.sort(function(a,b) { return a.date-b.date;});
        } else if (sortmode%4 == 1) {
          sortArray.sort(function(a,b) { return b.date-a.date;});
        } else if (sortmode%4 == 2) {
          sortArray.sort(function(a,b) { return a.stars-b.stars;});
        } else if (sortmode%4 == 3) {
          sortArray.sort(function(a,b) { return b.stars-a.stars;});
        }

        xScale.domain(sortArray.map(function(d,i) { return sortArray[i].id; }));

        var transition = svg.transition().duration(500),
            delay = function(d, i) { return i * 50; };
        
        sortArray.forEach(function(d,i) {  
          svg.select("#b"+sortArray[i].id)
             .transition()
             .duration(500)
             .attr("x", function(d) {
                return xScale(sortArray[i].id);
              });
          })

        transition.select(".x.axis")
                  .call(xAxis)
                  // .append("text")
                  // .text(function(d,i) { return sortArray[i].dateLabel })
      }

      function changeMarkerState(svg,marker,buttonState,buttonID) {
        var points = svg.select("#m"+buttonID).attr("points");
        var pntArray = points.split(",").map(Number);

        if(buttonState > 0) {
          svg.select("#m"+buttonID)
             .attr("transform", "rotate("+180+","+(pntArray[0]+5) +","+pntArray[5]+")");
        } else if (buttonState < 0) {
          svg.select("#m"+buttonID)
             .attr("transform", "rotate("+360+","+(pntArray[0]+5) +","+pntArray[5]+")");
        }
      }
      
      function legendX(partArray,i){
        if (i == 0){
          return 1;
        }else if (i == 1) {
          return (partArray[i-1]);
        }else if (i == 2) {
          return (partArray[0])+(partArray[i-1]);
        }else if (i == 3) {
          return (partArray[0])+(partArray[1])+(partArray[i-1]);
        }else if (i == 4) {
          return (partArray[0])+(partArray[1])+(partArray[2])+(partArray[i-1]);
        }
      }
      
      function firstVisitInit(textBox) {
        var width = findByID(posArray,activeId).width;
        var x = findByID(posArray,activeId).x;
        var x1 = parseFloat(x) + parseFloat(width/2);
        d3.select(".barChart")
              .select("#r"+parseInt(activeId))
              .transition()
              .duration(100)
              .attr("fill", "#66CCFF");
        showInfo(textBox,x);
        textStyle(textBox,x,250);
  
        d3.select(".barChart")
          .select("#p")
          .transition()
          .duration(100)
          .style("fill", "#66CCFF")
          .style("stroke", "#66CCFF")
          .attr("points",(x1+","+50+","+(x1-10)+","+60+","+(x1+10)+","+60) );
      }

      function findByID(src,id) {
        return src.filter( function(obj) {
          return +obj.id == id;
        })[0];
      }
    </script>
  </body>
</html>
