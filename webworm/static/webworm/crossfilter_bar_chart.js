"use strict";

function barChart() {
    // BoE: barChart.id is shared by all instances of barChart's chart, effectively an instance counter
    if (!barChart.id) barChart.id = 0;

    var margin = {
            top: 10,
            right: 10,
            bottom: 20,
            left: 10
        },
        x,
        y = d3.scale.linear().range([100, 0]), // 100 pixels height
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round,
        yMax;

    function chart(div) {
        /*
        // BoE: uncomment this to see how the domain and ranges change as the filters are modified
        console.log("margin", margin);
        console.log("x.range()", x.range())
        console.log("x.domain()", x.domain())
        console.log("y.range()", y.range())
        console.log("y.domain()", y.domain())
        */

        var width = x.range()[1],
            height = y.range()[0];

        yMax = 0;
        y.domain([0, yMax == 0 ? group.top(1)[0].value : yMax]); // set y domain to max value in this group

        // BoE: why is this done using "each"? There is only one div per chart; therefore the construct "div.each" will
        //    only be executed once
        div.each(function() {
            var div = d3.select(this),
                g = div.select("g");

            // Create the skeletal chart.
            // BoE: this is only executed once, at init, when there is nothing in the group
            if (g.empty()) {
                div.select(".title").append("a")
                    .attr("href", "javascript:reset(" + id + ")")
                    .attr("class", "reset")
                    .text("reset")
                    .style("display", "none");

                g = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // BoE: reset the clip path to full width
                g.append("clipPath")
                    .attr("id", "clip-" + id)
                    .append("rect")
                    .attr("width", width)
                    .attr("height", height);

                // BoE: generate two paths, one background, one foreground
                g.selectAll(".bar")
                    .data(["background", "foreground"])
                    .enter().append("path")
                    .attr("class", function(d) {
                        return d + " bar";
                    })
                    // assign all the data in the group to the path
                    .datum(group.all());

                // BoE: assign the clip path to the foreground bars
                g.selectAll(".foreground.bar")
                    .attr("clip-path", "url(#clip-" + id + ")");

                // BoE: add the x-axis to the svg group
                g.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(axis);

                // Initialize the brush component with pretty resize handles.
                var gBrush = g.append("g").attr("class", "brush").call(brush);
                gBrush.selectAll("rect").attr("height", height);
                gBrush.selectAll(".resize").append("path").attr("d", resizePath);
            }

            // Only redraw the brush if set externally.
            // BoE: at init, the **Date** chart has an externally set brush;
            // in this extended example, the **Time of Day** chart also has an externally set brush
            if (brushDirty) {
                brushDirty = false;
                g.selectAll(".brush").call(brush);
                div.select(".title a").style("display", brush.empty() ? "none" : null);
                if (brush.empty()) {
                    g.selectAll("#clip-" + id + " rect")
                        .attr("x", 0)
                        .attr("width", width);
                } else {
                    var extent = brush.extent();
                    g.selectAll("#clip-" + id + " rect")
                        .attr("x", x(extent[0]))
                        .attr("width", x(extent[1]) - x(extent[0]));
                }
            }

            // BoE: this sets the **d** attribute on the path
            g.selectAll(".bar").attr("d", barPath);
        });

        // BoE: the barPath function is called as usual with the d, i, a arguments 
        //   (d being called **groups** here, the other args not used)
        function barPath(groups) {
            var path = [],
                i = -1,
                n = groups.length,
                d;
            while (++i < n) {
                d = groups[i];
                path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
            }
            // BoE: uncomment the next line to see the neat path array that has been generated
            //console.log("path", path)
            return path.join("");
        }

        // BoE: the resizePath function defines the look of the brush "handles" on the left and right side of the brush
        function resizePath(d) {
            var e = +(d == "e"),
                x = e ? 1 : -1,
                y = height / 3;
            return "M" + (.5 * x) + "," + y +
                "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) +
                "V" + (2 * y - 6) +
                "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) +
                "Z" +
                "M" + (2.5 * x) + "," + (y + 8) +
                "V" + (2 * y - 8) +
                "M" + (4.5 * x) + "," + (y + 8) +
                "V" + (2 * y - 8);
        }
    }

    // BoE: the .chart below threw me for a loop at first; turns out the app is registering multiple brush handlers;
    //   see above for the first instance of brush handlers; to allow multiple handlers to be registered on the same event, 
    //   d3 requires a "namespace identifier" on the subsequent event handlers; here "chart" is used as a namespace indicator
    //   alse see: http://stackoverflow.com/questions/32459420/what-does-d3-brush-onbrush-chat-means
    brush.on("brushstart.chart", function() {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", null);
    });

    // BoE: uncomment the next like to see another brush handler in action using a dummy namespace
    //brush.on("brush.whatever", function() { console.log("brush.whatever") })

    // BoE: this "brush.chart" event handler fires before the "brush" handler fires above; 
    //    this particular handler just sets the filter; 
    //    the other handler updates all charts
    brush.on("brush.chart", function() {
        var g = d3.select(this.parentNode),
            extent = brush.extent(); // extent contains the domain (x.invert) of the brush

        // BoE: handle rounding of extent (allow only integers)
        if (round) g.select(".brush")
            .call(brush.extent(extent = extent.map(round)))
            .selectAll(".resize")
            .style("display", null); // remove the resize a element
        g.select("#clip-" + id + " rect")
            .attr("x", x(extent[0])) // set clip rect x pos
            .attr("width", x(extent[1]) - x(extent[0])); // set clip rect width

        // BoE: set a new filter range
        dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
        if (brush.empty()) {
            // BoE: if brush is empty, invalidate the clip rect (show all foreground bars), and remove the dimension filter
            var div = d3.select(this.parentNode.parentNode.parentNode);

            // BoE: remove the reset "a" element
            div.select(".title a").style("display", "none");

            // BoE: invalidate the clip rect (thereby show all foreground blue bars)
            div.select("#clip-" + id + " rect")
                .attr("x", null) // remove the x attribute which will render the clipRect invalid
                .attr("width", "100%");

            // BoE: remove the dimension's filter
            dimension.filterAll();
        }
    });

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        axis.scale(x);
        brush.x(x);
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    };

    chart.dimension = function(_) {
        //console.log("chart.dimension..." + _)
        if (!arguments.length) return dimension;
        dimension = _;
        return chart;
    };

    chart.filter = function(_) {
        if (_) {
            brush.extent(_);
            dimension.filterRange(_);
        } else {
            brush.clear();
            dimension.filterAll();
        }
        brushDirty = true;
        return chart;
    };

    chart.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        // added by BoE
        yMax = group.top(1)[0].value;
        return chart;
    };

    chart.round = function(_) {
        if (!arguments.length) return round;
        round = _;
        return chart;
    };

    // BoE: the d3 rebind function moves the "on" method from the "brush" object/function to the "chart" object/function;
    // it then returns the "chart" function/object
    return d3.rebind(chart, brush, "on");
};