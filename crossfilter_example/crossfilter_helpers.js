"use strict";

// Parse the date.  Assume it is the year 2001.
function parseDate(d) {  // (parseDate is like d3.time.format, but faster)
    return new Date(2001,
        d.substring(0, 2) - 1,
        d.substring(2, 4),
        d.substring(4, 6),
        d.substring(6, 8));
}

// Various formatters.
var formatWholeNumber = d3.format(",d"),
    formatChange = d3.format("+,d"),
    formatDate = d3.time.format("%B %d, %Y"),
    formatDateWithDay = d3.time.format("%a %B %d, %Y"),
    formatTime = d3.time.format("%I:%M %p");

function valueFormatted(d, i) {
    // Prepare a given value for display

    var cur_item = XFILTER_PARAMS.display_fields[i];
    var value = d[cur_item.data_field];
    var value_formatted;

    if("format_string" in cur_item) {
        value_formatted = 
            d3.format(cur_item.format_string)(value);
    } else {
        value_formatted = value;
    }

    if("suffix" in cur_item) {
        value_formatted += cur_item.suffix;
    }

    return value_formatted;
}


function createDataSetView(data_xfilter_size, date) {
    // DATASET VIEW
    // Create canvas element that holds one record per canvas pixel
    // Make the width 2 * the square root of the total data size, so the box is
    // at most 1:2 rectangle.  Squish the box so it's a thin vertical
    // rectangle if the client window width is smaller than this, though.
    var canvasWidth = Math.min(d3.select("body").property("clientWidth"),
                               2 * Math.ceil(Math.sqrt(data_xfilter_size)));
    var canvasHeight = Math.ceil(data_xfilter_size / canvasWidth);
    var canvas, datasetview_ctx, currentLabel;

    // Get reference to canvas div
    var datasetviewDiv = d3.select("#datasetview");

    // Add div to hold description of canvas content
    datasetviewDiv.select(".title")
        .html("<span>Dataset View – Each of the " +
              formatWholeNumber(data_xfilter_size) +
              " pixels represents a data record.</span>")

    // Add canvas element and mouse handler
    canvas = datasetviewDiv.selectAll("canvas")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
        .style("width", canvasWidth + "px")
        .style("height", canvasHeight + "px")
        .on("mousemove", function() {
            var mouse = d3.mouse(canvas.node()),
                x = Math.round(mouse[0]),
                y = Math.round(mouse[1]),
                index = y * canvasWidth + x;

            // Event handler delivers mouse mousemove events outside the
            // canvas sometimes (don't know why); therefore, ensure that only
            // valid x and y values are processed
            if (x < 0 || x > canvasWidth - 1 || y < 0 || y > canvasHeight - 1) {
                currentLabel.html("&nbsp;");
                return;
            }
            // then check if the index is out of bounds
            // (the right part of the last row is NOT part of the dataset)        
            if (index > data_xfilter_size - 1) {
                currentLabel.html("&nbsp;");
                return;
            }

            var item = data_rows[index],
                dateText = formatDateWithDay(item.date),
                timeText = formatTime(item.date);

            var labelText = labelText = "Selected: " + item.selected + ", Date: " + dateText + " " + timeText + ", Delay: ";
            labelText += item.delay + ", Distance: " + item.distance + ", Route: " + item.origin + "-->" + item.destination + " (idx: " + index + ")";
            currentLabel
                .attr("class", function(d) {
                    return item.selected ? "selected" : "notSelected"
                })
                .text(labelText);
        })
        .on("mouseleave", function() {
            currentLabel.html("&nbsp;");
        })

    // Create label for mousemove
    currentLabel = datasetviewDiv.append("label").html("&nbsp;");

    // Get context to canvas elem
    datasetview_ctx = canvas.node().getContext('2d');

    // Provide a callback method to redraw the data set view canvas
    function redraw_datasetview(rows_selected) {
        // Clear data set view canvas
        datasetview_ctx.fillStyle = "rgb(0,0,0)";
        datasetview_ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Add red out of bounds pixels 
        var xSpan = (canvasWidth * canvasHeight) % data_xfilter_size;
        var x = canvasWidth - xSpan;
        var y = canvasHeight - 1;
        datasetview_ctx.fillStyle = "rgb(255, 0, 0)";
        datasetview_ctx.fillRect(x, y, xSpan, 1);


        // Add: draw white pixel for each active element
        datasetview_ctx.fillStyle = "rgb(255,255,255)";
        rows_selected.forEach(function(d) {
            var x = d.index % canvasWidth;
            var y = Math.floor(d.index / canvasWidth)
            datasetview_ctx.fillRect(x, y, 1, 1);
        });
    }

    return redraw_datasetview;
}
