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
    formatDate = d3.timeFormat("%B %d, %Y"),
    formatDateWithDay = d3.timeFormat("%a %B %d, %Y"),
    formatTime = d3.timeFormat("%I:%M %p");

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


function createDataSetView(data_xfilter_size, data_rows, datetime_dimension) {
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

            var item = data_rows[index];

            var labelText = labelText = "Selected: " + item.selected + ", Date: " + formatDateWithDay(item.datetime) + " " + formatTime(item.datetime) + ", Delay: ";
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
    function redraw_datasetview() {
        // Update the "rows_selected" array, which holds
        // the currently selected (in-filter) items
        let rows_selected = datetime_dimension.top(Infinity);

        // Set the selected status in the data source ("data_rows")
        data_rows.forEach(function(d) {
            d.selected = false;
        }); // first clear all
        rows_selected.forEach(function(d) {
            data_rows[d.index].selected = true;
        }) // then set some 

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


///////////////////////////////////////////////////////
function createRadioButtons(data_xfilter, renderAll) {

    // Add new day dimension
    var dayNumber = data_xfilter.dimension(function(d) {
        return d.datetime.getDay();
    });

    // Date selection radio buttons
    // Day selection variables
    var days = {
            mon: {
                state: true,
                name: "days",
                text: "Monday",
                type: "workDay",
                dayNumber: 1,
                order: 0
            },
            tue: {
                state: true,
                name: "days",
                text: "Tuesday",
                type: "workDay",
                dayNumber: 2,
                order: 1
            },
            wed: {
                state: true,
                name: "days",
                text: "Wednesday",
                type: "workDay",
                dayNumber: 3,
                order: 2
            },
            thu: {
                state: true,
                name: "days",
                text: "Thursday",
                type: "workDay",
                dayNumber: 4,
                order: 3
            },
            fri: {
                state: true,
                name: "days",
                text: "Friday",
                type: "workDay",
                dayNumber: 5,
                order: 4
            },
            sat: {
                state: true,
                name: "days",
                text: "Saturday",
                type: "weekendDay",
                dayNumber: 6,
                order: 5
            },
            sun: {
                state: true,
                name: "days",
                text: "Sunday",
                type: "weekendDay",
                dayNumber: 0,
                order: 6
            }
        }

    var workDays = Object.keys(days).filter(function(d) {
            if (days[d].type == "workDay") return true;
        }).map(function(d) {return d;})

    var weekendDays = Object.keys(days).filter(function(d) {
            if (days[d].type == "weekendDay") return true;
        }).map(function(d) {return d;})

    var dayNumbers = (function() {
        var obj = {};
        Object.keys(days).forEach(function(d) {
            var key = days[d].dayNumber;
            var value = d;
            obj[key] = value
        });
        return obj;
    })()

    var dayTypes = {
        weekendDays: {
            state: false,
            name: "dayType",
            text: "Weekend Days",
            order: 2
        },
        allDays: {
            state: true,
            name: "dayType",
            text: "All Days",
            order: 0
        },
        workDays: {
            state: false,
            name: "dayType",
            text: "Work Days",
            order: 1
        },
        someDays: {
            state: false,
            name: "dayType",
            text: "Some Days",
            order: 3,
            last: true
        }
    };

    /*
    // BoE: uncomment this to see the day related variables
    console.log("workDays", workDays)
    console.log("weekendDays", weekendDays)
    console.log("dayNumbers", dayNumbers)
    */

    // BoE: prep add radio buttons and checkbox data
    var radioData = Object.keys(dayTypes).map(function(d) {
        dayTypes[d].value = d;
        return dayTypes[d];
    }).sort(function(a, b) {
        return (a.order > b.order ? 1 : (a.order < b.order) ? -1 : 0)
    })
    var checkboxData = Object.keys(days).map(function(d) {
        days[d].value = d;
        return days[d];
    }).sort(function(a, b) {
        return (a.order > b.order ? 1 : (a.order < b.order) ? -1 : 0)
    })

    // Create radio buttons
    // http://stackoverflow.com/questions/19302318/
    var fieldset = d3.select("#daySelectionDiv").append("fieldset")
    fieldset.append("legend").text("Day of Week");

    // Add spans to hold radio buttons
    var radioSpan = fieldset.selectAll(".radio")
        .data(radioData)
        .enter().append("span")
        .attr("class", "radio")
        .style("margin-right", function(d) {
            return d.last == true ? "30px" : "0px"
        });

    // Add radio button to each span
    radioSpan.append("input")
        .attr("type", "radio")
        .attr("name", function(d) { return d.name; })
        .property("checked", function(d) { return d.state; })
        .property("value", function(d) { return d.value; });

    // Add radio button label
    radioSpan.append("label")
        .text(function(d) {
            return d.text
        });

    // Add spans to hold checkboxes
    var checkboxSpan = fieldset.selectAll(".checkbox")
        .data(checkboxData)
        .enter().append("span")
        .attr("class", "checkbox")

    // Add checkbox to each span
    checkboxSpan
        .append("input")
        .attr("type", "checkbox")
        .attr("name", function(d) { return d.name; })
        .property("checked", function(d) { return d.state; })
        .property("value", function(d) { return d.value; });

    // Add checkbox label
    checkboxSpan
        .append("label")
        .text(function(d) {
            return d.text
        })


    // Add radio button event handler
    d3.selectAll("input[type=radio][name=dayType]")
        .on("change", function() {
            var elem = d3.select(this);
            var dayType = elem.property("value");
            switch (dayType) {
                case "allDays":
                case "someDays":
                    workDays.forEach(function(day) {
                        days[day].state = true;
                    })
                    weekendDays.forEach(function(day) {
                        days[day].state = true;
                    })
                    break;
                case "workDays":
                    workDays.forEach(function(day) {
                        days[day].state = true;
                    })
                    weekendDays.forEach(function(day) {
                        days[day].state = false;
                    })
                    break;
                case "weekendDays":
                    workDays.forEach(function(day) {
                        days[day].state = false;
                    })
                    weekendDays.forEach(function(day) {
                        days[day].state = true;
                    })
                    break;
            }

            updateDaySelection();
            renderAll();
        });

    // Init checkboxes and add event handler
    d3.selectAll("input[type=checkbox][name=days]")
        .property("checked", function(d, i, a) {
            var elem = d3.select(this);
            var day = elem.property("value");
            return days[day].state;
        })
        .on("change", function() {
            var elem = d3.select(this);
            var checked = elem.property("checked");
            var day = elem.property("value");
            days[day].state = checked;

            updateDaySelection();
            renderAll();
        })


    // Update the state of the day selection radio buttons and checkboxes
    // (called after "change" events from those elements)
    function updateDaySelection() {
        // Update checkboxes
        d3.selectAll("input[type=checkbox][name=days]")
            .property("checked", function(d, i, a) {
                var elem = d3.select(this);
                var day = elem.property("value");
                return days[day].state;
            })

        // Process selected days
        var workDayCount = workDays.reduce(function(p, c) {
            return (days[c].state) ? p + 1 : p
        }, 0);
        var weekendDayCount = weekendDays.reduce(function(p, c) {
            return (days[c].state) ? p + 1 : p
        }, 0);

        // Determine day type
        var dayType = "someDays";
        if ((workDayCount + weekendDayCount) == 7) dayType = "allDays"
        else if (workDayCount == 5 && weekendDayCount == 0) dayType = "workDays"
        else if (workDayCount == 0 && weekendDayCount == 2) dayType = "weekendDays"

        // Set the selected radio button
        d3.selectAll("input[type=radio][value=" + dayType + "]").property("checked", true);

        // Create/update day number filter
        dayNumber.filter(function(d) {
            return days[dayNumbers[d]].state;
        })
    }    

    return updateDaySelection;
}

////////////////////////////////////////////////
function get_resultsList(datetime_dimension) {

    function resultsList(div) {
        // Results list
        // Nest the results by date
        var resultsByDate = d3.nest().key(function(d) {
            return d3.timeDay(d.datetime);
            })
            // Limit results shown to at most max_results
            .entries(datetime_dimension.top(XFILTER_PARAMS.max_results));
    
        // For each day group, create a div with class = cur_results_list_group,
        // and then create a day label div and
        //                 the results row divs
        div.each(function() {
            var cur_results_list = d3.select(this).selectAll(".cur_results_list_group")
                .data(resultsByDate, function(d) {
                    return d.key;
                });
    
            cur_results_list.enter().append("div")
                .attr("class", "cur_results_list_group")
                .append("div")
                .attr("class", "day_group_label")
                .text(function(d) {
                    return formatDate(d.values[0].datetime);
                });

            cur_results_list.exit().remove();
    
            var results_row = cur_results_list.order().selectAll(".results_list_row")
                .data(function(d) {
                    return d.values;
                }, function(d) {
                    return d.index;
                });

            var results_row_all = results_row.enter().append("div")
                .attr("class", "results_list_row");

            results_row_all.append("div")
                .attr("class", "time")
                .text(function(d) {
                    return formatTime(d.datetime);
                });

        
            results_row_all.append("div")
                .attr("class", "display_field1")
                .text(function(d) { return valueFormatted(d, 0); });

            results_row_all.append("div")
                .attr("class", "display_field2")
                .text(function(d) { return valueFormatted(d, 1); });

            results_row_all.append("div")
                .attr("class", "user_field2")
                .text(function(d) { return valueFormatted(d, 3); });

            results_row_all.append("div")
                .attr("class", "user_field1")
                .classed("positive", function(d) { return d[XFILTER_PARAMS.display_fields[2].data_field] > 0; })
                .text(function(d) { return valueFormatted(d, 2); });
    
            results_row.exit().remove();
    
            results_row.order();
        });
    }

    return resultsList;
}