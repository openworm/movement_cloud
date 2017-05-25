// WORM PETRI DISH VISUALIZATION CODE
// sets up a d3.timer within the svg element of the wormVisualization div.
//////////////
d3.json("smaller.wcon", function(error, wcon_obj) {
    if (error) { console.log(error) }

    // process the worm WCON file.
    load_wcon_path(wcon_obj);
    
});

function load_wcon_path(wcon_obj) {
    wcon_path = wcon_obj;
    var wcon_path_x = wcon_obj.data[0].x[0];
    var wcon_path_y = wcon_obj.data[0].y[0];


}

var wcon_path;

var num_worms_visualized = 10;

var spermatozoa = d3.range(XFILTER_PARAMS.worm_petri_dish.MAX_WORMS_VISUALIZED).map(function() {
    var x = Math.random() * XFILTER_PARAMS.worm_petri_dish.width,
        y = Math.random() * XFILTER_PARAMS.worm_petri_dish.height;
    return {
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        path: d3.range(XFILTER_PARAMS.worm_petri_dish.m).map(function() {
            return [x, y];
        }),
        count: 0
    };
});

var svg = d3.select("#wormVisualization").selectAll("svg")
    .attr("width", XFILTER_PARAMS.worm_petri_dish.width)
    .attr("height", XFILTER_PARAMS.worm_petri_dish.height);

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
        if (x < 0 || x > XFILTER_PARAMS.worm_petri_dish.width) {
            spermatozoon.vx *= -1;
        }
        if (y < 0 || y > XFILTER_PARAMS.worm_petri_dish.height) {
            spermatozoon.vy *= -1;
        }

        // Swim!
        for (var j = 0; ++j < XFILTER_PARAMS.worm_petri_dish.m;) {
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
//////////////
