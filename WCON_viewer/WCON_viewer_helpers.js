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
    const dish_radius = WORMVIZ_PARAMS.worm_petri_dish.radius;
    const dish_centre = [dish_radius, dish_radius];
    // Allow margin for the full circle stroke to be visible
    const margin = {"left": 50, "top": 25, "right": 25, "bottom": 25};

    function getLimitsNestedArray(aa) {
        return [d3.min(aa, a => d3.max(a)),
                d3.max(aa, a => d3.max(a))];
    }

    // Find extents of data
    let limitsX = getLimitsNestedArray(wcon_data_obj[0].x);
    let limitsY = getLimitsNestedArray(wcon_data_obj[0].y);
    console.log(limitsX, limitsY);

    // set the chart scale to accommodate the data extent
    let scaleX = d3.scaleLinear()
        .domain(limitsX)
        .range([0, dish_radius*2])

    let scaleY = d3.scaleLinear()
        .domain(limitsY)
        .range([0, dish_radius*2])

    ///////////////////
    // Create visual elements
    var svg = d3.select("#wormVisualization").selectAll("svg")
        .attr("width", dish_radius*2 + margin.left + margin.right)
        .attr("height", dish_radius*2 + margin.top + margin.bottom)

    let chart = svg.append("g")
            .attr("class", "chart")
            .attr("transform", "translate(" + String(margin.left) + ", " +
                                              String(margin.top) + ")");

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

    // Dish outline
    chart.append("circle")
        .attr("class", "dish_outline")
        .attr("cx", dish_centre[0])
        .attr("cy", dish_centre[1])
        .attr("r", dish_radius);

    
    let lineData = [ [1, 20, 40, 60, 80, 100] , [5, 20, 10, 40, 5, 60]];

    let lineDataP = [];
    for(let len=lineData[0].length, i=0; i<len; i++) {
        lineDataP.push({"x": lineData[0][i], 
                        "y": lineData[1][i]});
    }
    var lineFunction = d3.line().x(d=>d.x).y(d=>d.y);
    chart.append("path")
        .attr("class", "worm_skeleton")
        .attr("d", lineFunction(lineDataP));


/*
    let fullPath = [];
    for(let len=wcon_data_obj[0].x.length, i=0; i<len; i++) {
        fullPath.push({"x": wcon_data_obj[0].x[i][0]+100,
                       "y": wcon_data_obj[0].y[i][0]+100 })
    }

    var wcon_path_x = wcon_data_obj[0].x[0];
    var wcon_path_y = wcon_data_obj[0].y[0];

    var wcon_path;

    let lineData = [ wcon_path_x, wcon_path_y ];
    console.log(fullPath);

    // The data for our line
    var lineData2 = [ { "x": 1,   "y": 5},  { "x": 20,  "y": 20},
                     { "x": 40,  "y": 10}, { "x": 60,  "y": 40},
                     { "x": 80,  "y": 5},  { "x": 100, "y": 60}];

    // This is the accessor function we talked about above
    var lineFunction = d3.line().x(d=>d.x).y(d=>d.y);

    chart.append("path")
        .attr("class", "worm_skeleton")
        .attr("d", lineFunction(fullPath));
*/





    return;




    // Sperm
    var spermatozoa = d3.range(num_worms).map(function() {
        var x = Math.random() * (limitsX[1] - limitsX[0]) + limitsX[0],
            y = Math.random() * (limitsY[1] - limitsY[0]) + limitsY[0];
        return {
            vx: Math.random() * 0.000002,
            vy: Math.random() * 0.000002,
            path: d3.range(WORMVIZ_PARAMS.worm_petri_dish.m).map(function() {
                return [x, y];
            }),
            count: 0
        };
    });
    
    console.log("num_worms", num_worms);
    console.log("spermatozoa", spermatozoa);

    var g = chart.append("div").attr("class", "worms")
        .selectAll("g")
        .data(spermatozoa)
        .enter().append("g")
        //.attr("x", d => scaleX(d))
        //.attr("y", d => scaleY(d))
    
    var head = g.append("ellipse")
        .attr("rx", 6.5 / 200)
        .attr("ry", 4 / 200);
    
    g.append("path")
        .datum(function(d) {
            return d.path.slice(0, 3);
        })
        .attr("class", "mid");
    
    g.append("path")
        .datum(function(d) {
            return d.path;
        })
        .attr("class", "tail");
    
    var tail = g.selectAll("path");
    
    d3.timer(function() {
        for (var i = -1; ++i < num_worms;) {
/*
            var spermatozoon = spermatozoa[i],
                path = spermatozoon.path,
                dx = spermatozoon.vx,
                dy = spermatozoon.vy,
                x = path[0][0] += dx,
                y = path[0][1] += dy,
                speed = Math.sqrt(dx * dx + dy * dy),
                count = speed * 10,
                k1 = -5 - speed / 3;
*/
            //console.log("(x,y)", "" + x + ", " + y);
  /*  
            // Bounce off the walls.
            let distance_to_wall = Math.hypot(dish_centre[0]-x, dish_centre[1]-y);
            if (distance_to_wall >= dish_radius) {
                // Bounce the worm correctly!

                // Compute the normal vector (just points right back to centre)
                // at the point of contact
                let normal_v = [x - dish_centre[0], y - dish_centre[1]];

                // The component of the velocity along the normal will 
                // switch direction while the component of velocity 
                // perpendicular to the normal will remain the same.
                if (Math.sign(normal_v[0]) == Math.sign(spermatozoon.vx)) {
                    spermatozoon.vx *= -1;
                } 
                if (Math.sign(normal_v[1]) == Math.sign(spermatozoon.vy)) {
                    spermatozoon.vy *= -1;
                } 
            }
*/
/*
            // Swim!
            for (var j = 0; ++j < WORMVIZ_PARAMS.worm_petri_dish.m;) {
                var vx = x - path[j][0],
                    vy = y - path[j][1],
                    k2 = Math.sin(((spermatozoon.count += count) + j * 3) / 300) / speed;
                path[j][0] = (x += dx / speed * k1) - dy * k2;
                path[j][1] = (y += dy / speed * k1) + dx * k2;
                speed = Math.sqrt((dx = vx) * dx + (dy = vy) * dy);
            }*/
        }
    
        head.attr("transform", headTransform);
        tail.attr("d", tailPath);
    });

    function headTransform(d) {
        return "translate(" + scaleX(d.path[0][0]) + " , " + scaleY(d.path[0][1]) + ")" +
               "rotate(" + Math.atan2(d.vy, d.vx) * (180 / Math.PI) + ")";
    }
    
    function tailPath(d) {
        return "M" + d.join("L");
    }



}
