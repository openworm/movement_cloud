// WCON Viewer
// Views a WCON file, showing all its metadata and the path of the worm
// WORM PETRI DISH VISUALIZATION CODE
// sets up a d3.timer within the svg element of the wormVisualization div.
//////////////
let wcon_objj; // DEBUG used for debugging

const wcon_file_name = "smaller.wcon";

// Load the worm schema, and use this information to render some explanation
// of what the WCON format is
d3.json(WORMVIZ_PARAMS.schema_url, function(error, schema_obj) {
    let footer = d3.select("#footer");

    footer.insert("div",".links").attr("class", "title")
        .append("h3").text(schema_obj.title);

    footer.insert("div",".links").attr("class", "description")
        .append("p").text(schema_obj.description);

});


// Display this specific WCON file
d3.json(wcon_file_name, function(error, wcon_obj) {
    if (error) { console.log(error) }

    let file_info = d3.select("#file_info");

    file_info.append("div")
        .attr("class", "file_info")
        .text("File name: " + String(wcon_file_name));

    file_info.append("div")
        .attr("class", "validation_state")
        .text("Validation state: " + "UNKNOWN");


    // process the worm WCON file.
    display_wcon(wcon_obj); 
});


function display_wcon(wcon_obj) {
    wcon_objj = wcon_obj;  // DEBUG

    get_wcon_path(wcon_obj.data);

    // Units
    let units_pivoted = pivot_object(wcon_obj.units, "dimension", "units");
    tabulate(d3.select("#units"), units_pivoted, ["dimension", "units"]);

    // 
    d3.select("#metadata").append("div")
        .attr("class", "metadata")
        .append("pre")
            .node().innerHTML = syntaxHighlight(wcon_obj.metadata);
}


function get_wcon_path(wcon_data_obj) {
    var wcon_path_x = wcon_data_obj[0].x[0];
    var wcon_path_y = wcon_data_obj[0].y[0];
}



////////////////////////////////////////////
// Visualization

var wcon_path;

var num_worms_visualized = WORMVIZ_PARAMS.worm_petri_dish.NUM_WORMS;

var spermatozoa = d3.range(WORMVIZ_PARAMS.worm_petri_dish.NUM_WORMS).map(function() {
    var x = Math.random() * WORMVIZ_PARAMS.worm_petri_dish.width,
        y = Math.random() * WORMVIZ_PARAMS.worm_petri_dish.height;
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
    .attr("width", WORMVIZ_PARAMS.worm_petri_dish.width)
    .attr("height", WORMVIZ_PARAMS.worm_petri_dish.height);

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
    for (var i = -1; ++i < num_worms_visualized;) {
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
        if (x < 0 || x > WORMVIZ_PARAMS.worm_petri_dish.width) {
            spermatozoon.vx *= -1;
        }
        if (y < 0 || y > WORMVIZ_PARAMS.worm_petri_dish.height) {
            spermatozoon.vy *= -1;
        }

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





