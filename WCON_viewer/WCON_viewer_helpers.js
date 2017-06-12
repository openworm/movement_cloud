"use strict"

///////////////////////////
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
// e.g. let unique = a.filter( onlyUnique );


//////////////////////////
function pivot_object(obj, key_column_name, value_column_name) {
    /* 
    This function pivots a key-value object into an array that can be
    made into a table, by introducing column names for the key and value

    e.g. pivot_object({"michael": 10, "edith": 7}, "name", "age")
    returns [{"name": "michael", "age": 10}, {"name": "edith", "age": 7}]
    */

    let obj_pivoted = [];
    let obj_keys = Object.keys(obj);

    for (let len=obj_keys.length, i=0; i<len; i++) {
        obj_pivoted.push({
            [key_column_name]: obj_keys[i],
            [value_column_name]: obj[obj_keys[i]]
        });
    }
    return obj_pivoted;
}


///////////////////////////
function tabulate(parent_DOM_element, data, columns) {
    /*  Create a table containing columns and data

        Parameters:
        -----------
        parent_DOM_element: will be the parent for the <table>
        data: a json object
        columns: an array of strings
    */

    var table = parent_DOM_element.append('table')
    var thead = table.append('thead')
    var tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
            .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append('td')
            .text(function (d) { return d.value; });

    return table;
}

////////////
function syntaxHighlight(json) {
    /*
        Return syntax-highlighted HTML for the json object or json string
        provited.
    */
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}



////////////////////////////////////////////
function create_worm_animation(DOM_viz, worm_data_obj, units) {
    /* Create worm animation
    
        Parameters
        ----------
        
        DOM_viz: the d3 selection for the DOM element containing an SVG for
                 the vizualization
        
        worm_data_obj: the data of the worm to animate

    */
    // Clear the timers for the old animation, if any
    d3.timerFlush();

    // Clear the old visualization, if any exists
    DOM_viz.selectAll("svg")
        // remove all child elements of the svg element
        .selectAll("*").remove();
    
    const max_width = WORMVIZ_PARAMS.worm_petri_dish.max_width;
    const max_height = WORMVIZ_PARAMS.worm_petri_dish.max_height;
    // Allow margin for the full circle stroke to be visible
    const margin = WORMVIZ_PARAMS.worm_petri_dish.margin;

    function getLimitsNestedArray(aa) {
        return [d3.min(aa, a => d3.min(a)),
                d3.max(aa, a => d3.max(a))];
    }

    // Find extents of data
    let limitsX = getLimitsNestedArray(worm_data_obj.x);
    let limitsY = getLimitsNestedArray(worm_data_obj.y);
    let domainSizeX = limitsX[1] - limitsX[0];
    if (domainSizeX === 0) {
        console.log("data X has 0-size domain.  Aborting."); return;
    }
    let domainSizeY = limitsY[1] - limitsY[0];
    if (domainSizeY === 0) {
        console.log("data Y has 0-size domain.  Aborting."); return;
    }
    // Let's find the maximum window size within [max_width, max_height]
    // that will preserve aspect ratio.
    let variable_height = max_width * (domainSizeY / domainSizeX);
    let variable_width = max_height * (domainSizeX / domainSizeY);
    let width, height;
    if (variable_height > max_height) {
        height = max_height;
        width = variable_width;
    } else if (variable_width > max_width) {
        width = max_width;
        height = variable_height;
    } else if (variable_height <= max_height && variable_width <= max_width) {
        // Now we have an embarassment of riches; let's arbitrarily choose Y
        height = max_height;
        width = variable_width;
    } else {
        // This condition should never arrive; one of the methods above should
        // work, mathematically speaking!
        console.log("Mathematical impossibility.  Aborting visualization.");
    }
    
    let svg_width = width + margin.left + margin.right;
    let svg_height = height + margin.top + margin.bottom;

    // set the chart scale to accommodate the data extent
    let scaleX = d3.scaleLinear()
        .domain([limitsX[0], limitsX[1]])
        .range([0, width]);

    let scaleY = d3.scaleLinear()
        .domain([limitsY[0], limitsY[1]])
        .range([0, height]);

    ///////////////////
    // Pan and zoom
    let viz_zoom = d3.zoom()
        // Do not allow zooming out i.e. < 1, and 
        // zooming to 10x size is probably enough.
        .scaleExtent([1, 10]) 
        .on("zoom", zoomed);

    // Create visual elements
    var svg = DOM_viz.selectAll("svg")
        .attr("width", svg_width)
        .attr("height", svg_height)
            // Enable pan and zoom
            .call(viz_zoom);

    let chart = svg.append("g")
            .attr("class", "chart")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + String(margin.left) + ", " +
                                              String(margin.top) + ")");

    let view = chart.append("g")
        .attr("class", "view")
        .attr("width", width)
        .attr("height", height);

    // TODO: put everything above BEFORE the CSV file loads.

    // Axes
    let xAxis = d3.axisTop().scale(scaleX).ticks(0);
    let xAxisGroup = chart.append("g")
        .attr("transform", "translate(0, " + String(max_height) + ")")
        .call(xAxis);


    let yAxis = d3.axisRight().scale(scaleY).ticks(0);
    let yAxisGroup = chart.append("g")
        //.attr("transform", "translate(0 0)")
        .call(yAxis);

    ///////////////////////////
    // Create distance scale element

    function create_distance_scale(k=1) {

        let distance_scale_line = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveBasis);

        // Here we find the nearest distance metric (log 10) to 
        // 20% of the screen width, to use as our distance scale legend.
        let ideal_range_scale_length = 0.2 * width;
        let ideal_domain_scale_length = (scaleX.invert(ideal_range_scale_length) - scaleX.invert(0)) / k;
        let rounded_domain_scale_decimal_places = Math.round(Math.log10(ideal_domain_scale_length));
        let rounded_domain_scale_length = Math.pow(10, rounded_domain_scale_decimal_places);
        let rounded_range_scale_length = (scaleX(rounded_domain_scale_length) - scaleX(0)) * k;

        // Format only the number of decimal places needed for the legend
        // e.g. 0.1 mm or 0.01mm, but not 0.10mm    
        let d3_format_needed = ".0f";
        if(rounded_domain_scale_decimal_places < 0) {
            d3_format_needed = "." + String(Math.abs(rounded_domain_scale_decimal_places)) + "f";
        }
    
        // DEBUG output
        //console.log("ideal range, domain:", ideal_range_scale_length, ideal_domain_scale_length);
        //console.log("rounded range, domain", rounded_range_scale_length, rounded_domain_scale_length);
    
        // Put the position 10% above and to the right of the bottom-left
        // corner, or closer if the dimensions are too small 
        let scale_pos = [Math.min(0.1 * width, width - 160),
                         Math.min(0.9 * height, height - 20)];
        let distance_scale1 = chart.selectAll("#distance-scale1");

        // Remove any current scale
        distance_scale1.selectAll("*").remove();

        distance_scale1
                .data([rounded_range_scale_length])
            .enter().append("g")
                .attr("class", "distance-scale")
                .attr("id", "distance-scale1")
                .attr("transform", "translate(" + String(scale_pos[0]) + ", " +
                                                  String(scale_pos[1]) + ")")
                .attr("width", d => d);
    
        distance_scale1.append('text')
            .attr("x", 0)
            .attr("y", 0)
            .attr("text-anchor", "start")
            .text(d3.format(d3_format_needed)(rounded_domain_scale_length)
                  + units.x);
    
        distance_scale1.append('path')
            .attr("class", "distance-scale-line")
            .attr("d", function(d, i) {
                var lineData = [
                    {"x": 0, "y": 10},
                    {"x": d, "y": 10}
                ];
        
                return distance_scale_line(lineData);
            });
    }

    // DEBUG: for some reason this must be called twice initially
    create_distance_scale();
    create_distance_scale();

    ///////////////////////////
    // Pan and zoom
    function zoomed() {
        let t = d3.event.transform;
        // The original svg box must be contained entirely within the
        // larger, zoomed bounding box.
        t.x = d3.min([t.x, 0]);
        t.y = d3.min([t.y, 0]);
        t.x = d3.max([t.x, (1-t.k) * svg_width]);
        t.y = d3.max([t.y, (1-t.k) * svg_height]);
        view.attr("transform", t);
        
        // Rescale the ticks on the axes according to our new zoom level
        // i.e. more zoom = more ticks
        xAxisGroup.call(xAxis.scale(d3.event.transform.rescaleX(scaleX)));
        yAxisGroup.call(yAxis.scale(d3.event.transform.rescaleY(scaleY)));
        create_distance_scale(t.k);
    }

    // Path of the worm's head across the whole video
    let fullHeadPath = [];
    for(let len=worm_data_obj.x.length, i=0; i<len; i++) {
        if(worm_data_obj.x[i][0] !== null) {
            fullHeadPath.push({"x": worm_data_obj.x[i][0],
                               "y": worm_data_obj.y[i][0] })
        }
    }

    function getSkeleton(frame_index) {
        // For a given worm and frame index, obtain an array of "x", "y" dicts
        // containing that frame's points.
        let points = [];
        for(let len=worm_data_obj.x[0].length, j=0; j<len; j++) {
            points.push({"x": worm_data_obj.x[frame_index][j],
                         "y": worm_data_obj.y[frame_index][j] })
        }
        return points;
    }

    let lineFunction = d3.line().x(d=>scaleX(d.x)).y(d=>scaleY(d.y));
    let worm_path_DOM = view.append("path")
        .attr("class", "worm_path")
        .attr("d", lineFunction(fullHeadPath));

    // Start at frame 0
    let worm_skeleton_DOM = view.append("path")
        .attr("class", "worm_skeleton")
        .attr("d", lineFunction(getSkeleton(0)));

    let worm_head_DOM = view.append("circle")
        .attr("class", "worm_head")
        // There is no simple way to obtain a reasonable head radius
        // in terms of the data's coordinate system, so instead we 
        // simply hardcode a pixel radius.
        .attr("r", 5);

    let frame_index = 0;
    const num_frames = worm_data_obj.t.length;
    let time_info = d3.selectAll(".time_info");
    let frame_info = d3.selectAll(".frame_info");
    let time_slider = d3.selectAll(".time_slider");
    time_slider
        .property("min", 0)
        .property("max", num_frames-1);

    let toggle_button = d3.select("#toggle_animation_button");
    toggle_button.on("click", function() {
            if(toggle_button.node().innerHTML === "PLAY") {
                animation_timer = createAnimationTimer();
                toggle_button.node().innerHTML = "PAUSE"
            } else {
                animation_timer.stop();
                toggle_button.node().innerHTML = "PLAY";
            }
        });

    d3.select("#time_slider_element").on("input", function() {
        frame_index = this.value;
        animation_timer.stop();
        draw_frame();
    });

    function draw_frame() {
        // Display the time and frame # and a slider
        let cur_time = d3.format(".2f")(worm_data_obj.t[frame_index]);
        frame_info.text("Frame " + d3.format("d")(frame_index));
        time_info.text("Time " + cur_time + units.t);
        time_slider.property("value", frame_index);

        // Move the worm to its position in the latest frame
        if(worm_data_obj.x[frame_index][0] !== null) {
            let skeleton_line = lineFunction(getSkeleton(frame_index));
            worm_skeleton_DOM
                .classed("worm_skeleton", true)
                .classed("worm_skeleton_nan", false)
                .attr("d", skeleton_line);
            
            worm_head_DOM
                .classed("worm_head", true)
                .classed("worm_head_nan", false)
                .attr("cx", scaleX(worm_data_obj.x[frame_index][0]))
                .attr("cy", scaleY(worm_data_obj.y[frame_index][0]));
        } else {
            // If the skeleton is just NaNs, go "grey" and don't move.
            worm_skeleton_DOM
                .classed("worm_skeleton", false)
                .classed("worm_skeleton_nan", true);

            worm_head_DOM
                .classed("worm_head", false)
                .classed("worm_head_nan", true);
        }
    }

    // Animate the worm's skeleton over time
    let animation_timer = createAnimationTimer();

    function createAnimationTimer() {
        // Toggle the "PLAY" button to accept "PAUSE" instead
        d3.select("#toggle_animation_button").node().innerHTML = "PAUSE";

        return d3.timer(function() {
            frame_index++;
            // Reset the animation if it has reached the end
            if (frame_index >= num_frames) { frame_index = 0; }
    
            // Draw the new frame
            draw_frame();
        });
    }
}
