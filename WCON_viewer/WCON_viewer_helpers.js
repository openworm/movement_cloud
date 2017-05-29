

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
function create_worm_animation(wcon_data_obj) {
    /* Create worm animation

    */

    // DEBUG: these two lines do nothing right now
    var wcon_path_x = wcon_data_obj[0].x[0];
    var wcon_path_y = wcon_data_obj[0].y[0];

    var wcon_path;

    const dish_radius = WORMVIZ_PARAMS.worm_petri_dish.radius;    
    const NUM_WORMS = WORMVIZ_PARAMS.worm_petri_dish.NUM_WORMS;
    
    var spermatozoa = d3.range(NUM_WORMS).map(function() {
        var x = Math.random() * (dish_radius*2),
            y = Math.random() * (dish_radius*2);
        return {
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1,
            path: d3.range(WORMVIZ_PARAMS.worm_petri_dish.m).map(function() {
                return [x, y];
            }),
            count: 0
        };
    });

    
    var svg = d3.select("#wormVisualization").selectAll("svg")
        // allow 10px buffer for the full circle stroke to be visible
        .attr("width", dish_radius*2 + 10) 
        .attr("height", dish_radius*2 + 10);
    
    const dish_centre = [dish_radius+5, dish_radius+5];

    svg.append("circle")
        .attr("class", "dish_outline")
        .attr("cx", dish_centre[0])
        .attr("cy", dish_centre[1])
        .attr("r", dish_radius);
    
    var g = svg.selectAll("g")
        .data(spermatozoa)
        .enter().append("g");
    
    var head = g.append("ellipse")
        .attr("rx", 6.5)
        .attr("ry", 4);
    
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
        for (var i = -1; ++i < NUM_WORMS;) {
            var spermatozoon = spermatozoa[i],
                path = spermatozoon.path,
                dx = spermatozoon.vx,
                dy = spermatozoon.vy,
                x = path[0][0] += dx,
                y = path[0][1] += dy,
                speed = Math.sqrt(dx * dx + dy * dy),
                count = speed * 10,
                k1 = -5 - speed / 3;
    
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

            //if (x < 0 || x > dish_radius*2) {
            //    spermatozoon.vx *= -1;
            //}
            //if (y < 0 || y > dish_radius*2) {
            //    spermatozoon.vy *= -1;
            //}
    
            // Swim!
            for (var j = 0; ++j < WORMVIZ_PARAMS.worm_petri_dish.m;) {
                var vx = x - path[j][0],
                    vy = y - path[j][1],
                    k2 = Math.sin(((spermatozoon.count += count) + j * 3) / 300) / speed;
                path[j][0] = (x += dx / speed * k1) - dy * k2;
                path[j][1] = (y += dy / speed * k1) + dx * k2;
                speed = Math.sqrt((dx = vx) * dx + (dy = vy) * dy);
            }
        }
    
        head.attr("transform", headTransform);
        tail.attr("d", tailPath);
    });
    
    function headTransform(d) {
        return "translate(" + d.path[0] + ")rotate(" + Math.atan2(d.vy, d.vx) * (180 / Math.PI) + ")";
    }
    
    function tailPath(d) {
        return "M" + d.join("L");
    }
}
