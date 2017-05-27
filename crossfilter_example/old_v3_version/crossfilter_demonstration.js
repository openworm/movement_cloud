// Crossfilter Demonstration
//
// By date, hour, and two other variables
//
"use strict";


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
    var date_dimension = data_xfilter.dimension(function(d) {
        return d.date;
    }); // date dim
    var dates = date_dimension.group(d3.time.day); // date group
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

    let updateDaySelection = createRadioButtons(dayNumber, renderAll);

    rows_selected = date_dimension.top(Infinity);
    // Create the datasetview widget, and obtain a callback function that
    // when called, refreshes the widget.
    var redraw_datasetview = createDataSetView(data_xfilter.size(), date_dimension); 

    var delay_min = d3.min(data_rows, function(d) { return +d.delay});
    var delay_max = d3.max(data_rows, function(d) { return +d.delay});

    var distance_min = d3.min(data_rows, function(d) { return +d.distance});
    var distance_max = d3.max(data_rows, function(d) { return +d.distance});

    // This code defines the four charts in an array
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
        .dimension(date_dimension)
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

    // Render the initial results lists
    let resultsList = get_resultsList(date_dimension);
    var results_list = d3.selectAll(".list").data([resultsList]);

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
        // render is called with this set to div and d set to the
        // chart function from barChart
        chart.each(render); 
        results_list.each(render);
        d3.select("#active").text(formatWholeNumber(crossfilter_all.value()));

        let max_worms = XFILTER_PARAMS.worm_petri_dish.MAX_WORMS_VISUALIZED;
        // Change the number of worms visualized to either the number of
        // results or the maximum the dish will hold, whichever is smaller.
        num_worms_visualized = Math.min(crossfilter_all.value(), max_worms);

        // Update the "rows_selected" array, which holds
        // the currently selected (in-filter) items
        rows_selected = date_dimension.top(Infinity);

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
        updateDaySelection(dayNumber);
        renderAll();
    };

    // Resets the filter for a particular dimension
    window.reset = function(i) {
        charts[i].filter(null);
        renderAll();
    };
}
