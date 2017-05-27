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
    // So we can display the total count of rows selected:
    const xfilter_all = data_xfilter.groupAll();  

    let x_filter_dimension = [];
    let x_filter_dimension_grouped = [];

    for(let i=0; i<4; i++) {
        // First get what field goes in chart i
        let cur_data_field = XFILTER_PARAMS.charts[i];
        // Then lookup all the stuff about that field
        let cur_field_attrs = XFILTER_PARAMS.display_fields[cur_data_field];
        let cur_xfilter_dim;
        if(i==0) {
            // DEBUG: hardcode the "hours" transformation for now, but remove
            // this later
            cur_xfilter_dim = data_xfilter.dimension(d => d[cur_data_field].getHours() + d[cur_data_field].getMinutes() / 60);
        } else {
            cur_xfilter_dim = data_xfilter.dimension(d => d[cur_data_field]);
        }

        // Add it to our list of x_filter dimensions
        x_filter_dimension.push(cur_xfilter_dim);


        // Add the title of the chart
        console.log(cur_data_field, cur_field_attrs.display_name);
        d3.selectAll("#chart"+String(i)+" .title").text(cur_field_attrs.display_name);
    }
    x_filter_dimension_grouped.push(x_filter_dimension[0].group(Math.floor));  // hour
    x_filter_dimension_grouped.push(x_filter_dimension[1].group(d => Math.floor(d / 10) * 10));  // delay
    x_filter_dimension_grouped.push(x_filter_dimension[2].group(d => Math.floor(d / 50) * 50));  // distances
    x_filter_dimension_grouped.push(x_filter_dimension[3].group(d3.timeDay)); // dateTime


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
        result_row_list   .each(render);
        d3.select('#active').text(formatWholeNumber(xfilter_all.value()));

        redraw_datasetview();
    }

    let updateDaySelection = createRadioButtons(data_xfilter, renderAll);

    // Create the datasetview widget, and obtain a callback function that
    // when called, refreshes the widget.
    var redraw_datasetview = createDataSetView(data_xfilter.size(), data_rows, x_filter_dimension[3]);  // DEBUG: fix hardcoding

    function getExtremes(field_name) {
        // Obtain the [min, max] scalar values from the data, for a given
        // column (aka field)
        const cur_min = d3.min(data_rows, function(d) { return +d[field_name]});
        const cur_max = d3.max(data_rows, function(d) { return +d[field_name]});

        return [cur_min, cur_max];
    }


    const charts = [

        barChart(renderAll)
            .dimension(x_filter_dimension[0])
            .group(x_filter_dimension_grouped[0])
            .x(d3.scaleLinear()
                .domain([0, 24])
                .rangeRound([0, 10 * 24])), // 10 pixels per bar, 240 pixels total

        barChart(renderAll)
            .dimension(x_filter_dimension[1])
            .group(x_filter_dimension_grouped[1])
            .x(d3.scaleLinear()
                .domain(getExtremes(XFILTER_PARAMS.charts[1]))
                .rangeRound([0, 10 * 21])), // 21 delay groups, 210 pixels total

        barChart(renderAll)
            .dimension(x_filter_dimension[2])
            .group(x_filter_dimension_grouped[2])
            .x(d3.scaleLinear()
                .domain(getExtremes(XFILTER_PARAMS.charts[2]))
                .rangeRound([0, 10 * 40])), // 40 distance groups

        barChart(renderAll)
            .dimension(x_filter_dimension[3])
            .group(x_filter_dimension_grouped[3])
            .round(d3.timeDay.round)
            .x(d3.scaleTime()
                .domain(getExtremes(XFILTER_PARAMS.charts[3]))
                .rangeRound([0, 10 * 90]))
            //.filter([new Date(2001, 1, 1), new Date(2001, 2, 1)]),    
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
    let resultsList = get_resultsList(x_filter_dimension[3]);
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
