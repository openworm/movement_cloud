// Crossfilter Demonstration
//
// By date, hour, and two other variables
//
"use strict";

// Get the data
d3.csv(XFILTER_PARAMS.data_file, (error, data_rows) => {
    if(error) { console.log(error); }

    // Set the titles in the report
    document.title = XFILTER_PARAMS.report_title;
    let title_element = document.getElementById("crossfilter_report_title");
    title_element.innerHTML = XFILTER_PARAMS.report_title;

    // A little coercion, since the CSV is untyped.
    data_rows.forEach((d, i) => {
        d.index = i;
        d.datetime = parseDate(d.datetime);
        d.delay = +d.delay;
        d.distance = +d.distance;
        //d.destination = d.destination + "HAHA";
    });

    create_crossfilter(data_rows);
})


function create_crossfilter(data_rows) {
    // Array that holds the currently selected "in-filter" selected records
    var rows_selected = [];

    // Create the crossfilter for the relevant dimensions and groups.
    const data_xfilter = crossfilter(data_rows);

    const xfilter_all = data_xfilter.groupAll();
    const datetime_dimension = data_xfilter.dimension(d => d.datetime);
    const dates = datetime_dimension.group(d3.timeDay);
    const hour_dimension = data_xfilter.dimension(d => d.datetime.getHours() + d.datetime.getMinutes() / 60);
    const hours = hour_dimension.group(Math.floor);
    const delay_dimension = data_xfilter.dimension(d => d.delay);
    const delays = delay_dimension.group(d => Math.floor(d / 10) * 10);
    const distance_dimension = data_xfilter.dimension(d => d.distance);
    const distances = distance_dimension.group(d => Math.floor(d / 50) * 50);

    let result_row_list;
    let chart_DOM_elements;

    // Renders the specified chart or list.
    function render(method) {
        d3.select(this).call(method);
    }

    // Re-rendering function, which we will later set to be trigged
    // whenever the brush moves and other events like that
    function renderAll() {
        chart_DOM_elements.each(render);
        result_row_list.each(render);
        d3.select('#active').text(formatWholeNumber(xfilter_all.value()));

        redraw_datasetview();
    }

    let updateDaySelection = createRadioButtons(data_xfilter, renderAll);

    // Create the datasetview widget, and obtain a callback function that
    // when called, refreshes the widget.
    var redraw_datasetview = createDataSetView(data_xfilter.size(), data_rows, datetime_dimension);


    var delay_min = d3.min(data_rows, function(d) { return +d.delay});
    var delay_max = d3.max(data_rows, function(d) { return +d.delay});

    var distance_min = d3.min(data_rows, function(d) { return +d.distance});
    var distance_max = d3.max(data_rows, function(d) { return +d.distance});

    const charts = [

        barChart(renderAll)
            .dimension(hour_dimension)
            .group(hours)
            .x(d3.scaleLinear()
                .domain([0, 24])
                .rangeRound([0, 10 * 24])), // 10 pixels per bar, 240 pixels total

        barChart(renderAll)
            .dimension(delay_dimension)
            .group(delays)
            .x(d3.scaleLinear()
                .domain([delay_min, delay_max])
                .rangeRound([0, 10 * 21])), // 21 delay groups, 210 pixels total

        barChart(renderAll)
            .dimension(distance_dimension)
            .group(distances)
            .x(d3.scaleLinear()
                .domain([distance_min, distance_max])
                .rangeRound([0, 10 * 40])), // 40 distance groups

        barChart(renderAll)
            .dimension(datetime_dimension)
            .group(dates)
            .round(d3.timeDay.round)
            .x(d3.scaleTime()
                .domain([new Date(2001, 0, 1), new Date(2001, 3, 1)])
                .rangeRound([0, 10 * 90]))
            .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)]),    
    ];

    // Given our array of charts, which we assume are in the same order as the
    // .chart elements in the DOM, bind the charts to the DOM and render them.
    // We also listen to the chart's brush events to update the display.
    chart_DOM_elements = d3.selectAll('.chart')
        .data(charts)
//            .each(function(chart) { console.log(chart); });

/*
                chart
                    .on("start brush end", function() {
                        renderAll();
                    })
            });
*/

    // Render the initial results lists
    let resultsList = get_resultsList(datetime_dimension);
    result_row_list = d3.selectAll(".result_row_list").data([resultsList]);

    // Render the total.
    d3.selectAll('#total')
        .text(formatWholeNumber(data_xfilter.size()));

    renderAll();
        
    window.filter = filters => {
        filters.forEach((d, i) => {
            charts[i].filter(d);
        });
        renderAll();
    };

    window.reset = i => {
        charts[i].filter(null);
        console.log("reset fired!");
        // DEBUG: somehow if you click reset, the results list does
        // not get refreshed.  Strange because we are calling renderAll
        // here...
        renderAll();
    };

}
