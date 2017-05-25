// Crossfilter Demonstration
//
// By date, hour, and two other variables
//
"use strict";

// Ensure at least 790px height if running in an iframe (bl.ocks)
// http://bl.ocks.org/mbostock/1093025
d3.select(self.frameElement).transition().duration(500).style("height",
                                                              "790px");

// Get the data
d3.csv(XFILTER_PARAMS.data_file, function(error, data_rows) {
    if (error) { console.log(error); }

    // Set the titles in the report
    document.title = XFILTER_PARAMS.report_title;
    report_title.innerHTML = XFILTER_PARAMS.report_title;

    // Create the crossfilter
    create_crossfilter(data_rows);
});
    
    
function create_crossfilter(data_rows) {
    // Array that holds the currently selected "in-filter" selected records
    var rows_selected = [];

    // A little coercion, since the CSV is untyped.
    data_rows.forEach(function(d, i) {
        d.index = i;
        d.date = parseDate(d.date);
        if(XFILTER_PARAMS.display_fields[2].data_type == "numeric") {
            d.delay = +d.delay
        }
        if(XFILTER_PARAMS.display_fields[3].data_type == "numeric") {
            d.distance = +d.distance
        }
        d.selected = false;
    });

    // Create the crossfilter for the relevant dimensions and groups.
    var data_xfilter = crossfilter(data_rows);
    let crossfilter_all = data_xfilter.groupAll();
    var datasetview_ctx;

    // date dimension
    var date = data_xfilter.dimension(function(d) {
        return d.date;
    }); // date dim
    var dates = date.group(d3.time.day); // date group
    dates.groupId = "dates";

    // hour dimension
    var hour = data_xfilter.dimension(function(d) {
        return d.date.getHours() + d.date.getMinutes() / 60;
    }); // hour dim
    var hours = hour.group(Math.floor); // hour group
    hours.groupId = "hours";

    // USER DIMENSION 1
    // delay dimension
    var cur_item = XFILTER_PARAMS.display_fields[2];
    var delay = data_xfilter.dimension(function(d) {
        return d[cur_item.data_field];
    }); // delay dim
    var delays = delay.group(function(d) {
        return Math.floor(d / cur_item.bucket_width) * cur_item.bucket_width;
    }); // delay group
    delays.groupId = cur_item.data_field + "s";  // e.g. "delays"

    // USER DIMENSION 2
    // distances dimension
    var distance = data_xfilter.dimension(function(d) {
        return d.distance;
    }); // distance dim
    var distances = distance.group(function(d) {
        return Math.floor(d / 10) * 10;
    }); // distance group
    distances.groupId = "distances";

    
    // Add new day dimension
    var dayNumber = data_xfilter.dimension(function(d) {
        return d.date.getDay();
    });
    var dayNumbers = dayNumber.group(function(d) {
        return d;
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
        .attr({
            type: "radio",
            name: function(d) {
                return d.name
            },
        })
        .property({
            checked: function(d) {
                return d.state
            },
            value: function(d) {
                return d.value
            }
        });

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
        .attr({
            type: "checkbox",
            name: function(d) {
                return d.name
            }
        })
        .property({
            value: function(d) {
                return d.value
            },
            checked: function(d) {
                return d.state
            }
        })

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

        // BoE: process selected days
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
    
    rows_selected = date.top(Infinity);
    var redraw_datasetview = createDataSetView(data_xfilter.size(), date); 

    var delay_min = d3.min(data_rows, function(d) { return +d.delay});
    var delay_max = d3.max(data_rows, function(d) { return +d.delay});

    var distance_min = d3.min(data_rows, function(d) { return +d.distance});
    var distance_max = d3.max(data_rows, function(d) { return +d.distance});

    // BoE: this code defines the four charts in an array
    var charts = [

        barChart()
        .dimension(hour)
        .group(hours)
        .x(d3.scale.linear()
            .domain([0, 24])
            .rangeRound([0, 10 * 24])) // 10 pixels per bar, 240 pixels total
        .filter([8, 18]), // added by BoE

        barChart()
        .dimension(delay)
        .group(delays)
        .x(d3.scale.linear()
            .domain([delay_min, delay_max])
            .rangeRound([0, 10 * 21])), // 21 delay groups, 210 pixels total

        barChart()
        .dimension(distance)
        .group(distances)
        .x(d3.scale.linear()
            .domain([distance_min, distance_max])
            .rangeRound([0, 10 * 40])), // 40 distance groups

        barChart()
        .dimension(date)
        .group(dates)
        .round(d3.time.day.round) // ensures whole days
        .x(d3.time.scale()
            .domain([new Date(2001, 0, 1), new Date(2002, 0, 1)]) // full year
            .rangeRound([0, 10 * 90]))
        // set an arbitrary filter from Feb to Mar to start as a demonstration
        .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)]) 
    ];


    // Given our array of charts, which we assume are in the same order as the
    // .chart elements in the DOM, bind the charts to the DOM and render them.
    // We also listen to the chart's brush events to update the display.
    var chart = d3.selectAll(".chart")
        // The charts array defined above are provided as data to
        // the d3 selection of ".charts"
        .data(charts)
        .each(function(chart) {
            chart
                .on("brush", function() {
                    renderAll();
                })
                .on("brushend", function() {
                    renderAll();
                });
        });

    // Render the initial lists
    var list = d3.selectAll(".list")
        .data([resultsList]);

    // Render the total
    d3.selectAll("#total")
        .text(formatWholeNumber(data_xfilter.size()));

    // Initial render
    renderAll();

    // Renders the specified chart or list.
    function render(method) {
        // "method" is the "d" value of data binding to chart above,
        // which happens to be the chart function from barChart
        d3.select(this).call(method);
    }

    // Whenever the brush moves, re-rendering everything.
    function renderAll() {
        // BoE: uncomment the next lines to see the what's being rendered
        //console.log("renderAll", chart[0].length, list[0].length, all.value())
        //chart.each(function(d, i) { console.log("this", this, "d", d, "i", i) })

        // render is called with this set to div and d set to the
        // chart function from barChart
        chart.each(render); 
        list.each(render);
        d3.select("#active").text(formatWholeNumber(crossfilter_all.value()));

        let max_worms = XFILTER_PARAMS.worm_petri_dish.MAX_WORMS_VISUALIZED;
        // Change the number of worms visualized to either the number of results
        // or the maximum the dish will hold, whichever is smaller.
        num_worms_visualized = Math.min(crossfilter_all.value(), max_worms);

        // Update the "rows_selected" array, which holds
        // the currently selected (in-filter) items
        rows_selected = date.top(Infinity);

        // Set the selected status in the data source ("data_rows")
        data_rows.forEach(function(d) {
            d.selected = false;
        }); // first clear all
        rows_selected.forEach(function(d) {
            data_rows[d.index].selected = true;
        }) // then set some 

        redraw_datasetview(rows_selected);
    }


    // This (window.resetAll) isn't used, therefore
    //    repurposed this to reset all filters by JavaScript
    //    triggered by a new "a" tag in the DOM
    window.resetAll = function() {
        var filters = [null, null, null, null];
        filters.forEach(function(d, i) {
            charts[i].filter(d);
        });
        Object.keys(days).forEach(function(d) {
            days[d].state = true
        });
        updateDaySelection();
        renderAll();
    };

    // Resets the filter for a particular dimension
    window.reset = function(i) {
        charts[i].filter(null);
        renderAll();
    };

    // Results list
    function resultsList(div) {
        // Nest the results by date
        var resultsByDate = d3.nest().key(function(d) {
            return d3.time.day(d.date);
            })
            // Limit results shown to at most max_results
            .entries(date.top(XFILTER_PARAMS.max_results));

        div.each(function() {
            var date = d3.select(this).selectAll(".date")
                .data(resultsByDate, function(d) {
                    return d.key;
                });

            date.enter().append("div")
                .attr("class", "date")
                .append("div")
                .attr("class", "day")
                .text(function(d) {
                    return formatDate(d.values[0].date);
                });

            date.exit().remove();

            var results_row = date.order().selectAll(".results_list_row")
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
                    return formatTime(d.date);
                });

            results_row_all.append("div")
                .attr("class", "display_field" + toString(0 + 1))
                .text(function(d) { return valueFormatted(d, 0)});

            results_row_all.append("div")
                .attr("class", "display_field" + toString(1 + 1))
                .text(function(d) { return valueFormatted(d, 1)});

            results_row_all.append("div")
                .attr("class", "user_field2")
                .text(function(d) { return valueFormatted(d, 3)});

            results_row_all.append("div")
                .attr("class", "user_field1")
                .classed("positive", function(d) { return d[XFILTER_PARAMS.display_fields[2].data_field] > 0; })
                .text(function(d) { return valueFormatted(d, 2)});

            results_row.exit().remove();

            results_row.order();
        });
    }
}
