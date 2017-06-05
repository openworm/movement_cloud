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
function create_worm_animation(wcon_data_obj, num_worms) {
    /* Create worm animation

    */
    const max_height = WORMVIZ_PARAMS.worm_petri_dish.max_height;
    const dish_centre = [dish_radius, dish_radius];
    // Allow margin for the full circle stroke to be visible
    const margin = WORMVIZ_PARAMS.worm_petri_dish.margin;
    const svg_width = dish_radius*2 + margin.left + margin.right;
    const svg_height = dish_radius*2 + margin.top + margin.bottom;

    function getLimitsNestedArray(aa) {
        return [d3.min(aa, a => d3.min(a)),
                d3.max(aa, a => d3.max(a))];
    }

    // Find extents of data
    let limitsX = getLimitsNestedArray(wcon_data_obj[0].x);
    let limitsY = getLimitsNestedArray(wcon_data_obj[0].y);
    let rangeX = limitsX[1] - limitsX[0];
    let rangeY = limitsY[1] - limitsY[0];

    // set the chart scale to accommodate the data extent
    let scaleX = d3.scaleLinear()
        .domain([limitsX[0] - rangeX/3, limitsX[1] + rangeX/3])
        .range([0, dish_radius*2]);

    let scaleY = d3.scaleLinear()
        .domain([limitsY[0] - rangeY/3, limitsY[1] + rangeY/3])
        .range([0, dish_radius*2]);

    ///////////////////
    // Pan and zoom
    let viz_zoom = d3.zoom()
        // Do not allow zooming out i.e. < 1, and 
        // zooming to 10x size is probably enough.
        .scaleExtent([1, 10]) 
        .on("zoom", zoomed);

    // Create visual elements
    var svg = d3.select("#wormVisualization").selectAll("svg")
        .attr("width", svg_width)
        .attr("height", svg_height)
            // Enable pan and zoom
            .call(viz_zoom);

    let chart = svg.append("g")
            .attr("class", "chart")
            .attr("width", dish_radius*2)
            .attr("height", dish_radius*2)
            .attr("transform", "translate(" + String(margin.left) + ", " +
                                              String(margin.top) + ")");

    let view = chart.append("g")
        .attr("class", "view")
        .attr("width", dish_radius*2)
        .attr("height", dish_radius*2);

    // TODO: put everything above BEFORE the CSV file loads.

    // Axes
    let xAxis = d3.axisBottom().scale(scaleX);
    let xAxisGroup = chart.append("g")
        .attr("transform", "translate(0, " + String(dish_radius*2) + ")")
        .call(xAxis);

    let yAxis = d3.axisLeft().scale(scaleY);
    let yAxisGroup = chart.append("g")
        //.attr("transform", "translate(0 0)")
        .call(yAxis);

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
    }



    // Dish outline
    view.append("circle")
        .attr("class", "dish_outline")
        .attr("cx", dish_centre[0])
        .attr("cy", dish_centre[1])
        .attr("r", dish_radius);

    // TODO: loop to animate all worms here instead of just one ([0])
    const worm_index = 0;

    // Path of the worm's head across the whole video
    let fullHeadPath = [];
    for(let len=wcon_data_obj[0].x.length, i=0; i<len; i++) {
        if(wcon_data_obj[worm_index].x[i][0] !== null) {
            fullHeadPath.push({"x": wcon_data_obj[worm_index].x[i][0],
                               "y": wcon_data_obj[worm_index].y[i][0] })
        }
    }

    function getSkeleton(worm_index, frame_index) {
        // For a given worm and frame index, obtain an array of "x", "y" dicts
        // containing that frame's points.
        let points = [];
        for(let len=wcon_data_obj[worm_index].x[0].length, j=0; j<len; j++) {
            points.push({"x": wcon_data_obj[worm_index].x[frame_index][j],
                         "y": wcon_data_obj[worm_index].y[frame_index][j] })
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
        .attr("d", lineFunction(getSkeleton(worm_index, 0)));

    let frame_index = 0;
    const num_frames = wcon_data_obj[worm_index].t.length;

    // TODO: have the frames arrive at the correct time.
    // TODO: add an svg representing the head of the worm.

    // Animate the worm's skeleton over time
    d3.timer(function() {
        frame_index++;
        // Reset the animation if it has reached the end
        if (frame_index >= num_frames) { frame_index = 0; }

        if(wcon_data_obj[worm_index].x[frame_index][0] !== null) {
            let skeleton_line = lineFunction(getSkeleton(worm_index,
                                                         frame_index));
            worm_skeleton_DOM
                .classed("worm_skeleton", true)
                .classed("worm_skeleton_nan", false)
                .attr("d", skeleton_line);
        } else {
            // If the skeleton is just NaNs, go "grey" and don't move.
            worm_skeleton_DOM
                .classed("worm_skeleton", false)
                .classed("worm_skeleton_nan", true);
        }
    });
}