// Crossfilter Demonstration
//
// By date, hour, and two other variables
//
"use strict";

// Exposing the crossfilter element so buttons like Download can gain
//   access to the data elements.
var globalCF;

if (hasCFData) {
    window.scrollTo(0,0);
    generateFileTypeCheckboxes();
    crossfilterData = augmentCrossfilterData(crossfilterData);
    // At this point, we're ready to let go of the load screen, and allow
    //   user interaction with the charts.
    // The reason we do this before the crossfilter charts are processed
    //   is because of the style settings. The crossfilter charts rely
    //   on the style settings of the master DOM to work properly.
    loading(false, 'None');

    XFILTER_PARAMS = createXfilterParams(XFILTER_PARAMS, crossfilterData);
    generateXfilterDerivedColumns(crossfilterData);
    processCrossfilterData(crossfilterData);
} else {
    // If no data is available, use the default example from a file
    d3.csv(XFILTER_PARAMS.data_file, crossfilter_callback);
}
if ((downloadData != 'None') && (downloadHeaders != 'None')) {
    generateDownloadData();
    // At this point, we're ready to let go of the load screen, and allow
    //   user interaction with the charts.
    loading(false, 'None');
}

function crossfilter_callback(error, data_rows) {
    if (error) { console.log(error); }
    processCrossfilterData(data_rows);
}

function processCrossfilterData(data_rows) {
   // Set the titles in the report
    document.title = XFILTER_PARAMS.report_title;
    let title_element = document.getElementById("crossfilter_report_title");
    title_element.innerHTML = XFILTER_PARAMS.report_title;
    
    // A little coercion, since the CSV is untyped.
    data_rows.forEach((d, i) => {
      // Create an index element
      d.index = i;
		    
      // Parse numeric fields to be numeric.
      const display_fields = Object.keys(XFILTER_PARAMS.data_fields);
      for (let len = display_fields.length, i=0; i<len; i++) {
	  const cur_field = display_fields[i];
	  const cur_attrs = XFILTER_PARAMS.data_fields[cur_field];
	  // If cur_field is supposed to be numeric, convert it from String
	  // to numeric.
	  if (cur_attrs.data_type == "numeric") {
	      d[cur_field] = +d[cur_field];
	  }
	  if (cur_attrs.data_type == "iso_date") {
	      d[cur_field] = d3.isoParse(d[cur_field]);
	      // Be sure to set the time component to 0 to get consistent
	      // EOD dates
	      d[cur_field].setHours(0,0,0,0);
	  }
      }        
      
      // Parse the timestamp into an actual Date object
      d.timestamp = parseDate(d.timestamp);
    });
	    
    create_crossfilter(data_rows);
}

function create_crossfilter(data_rows) {
    // Array that holds the currently selected "in-filter" selected records
    var rows_selected = [];

    // Defining accumulators for filesize
    var reduceAdd = function(p, v) {
	p.filesize += v.filesize;
	return p;
    }

    var reduceRemove = function(p, v) {
	p.filesize -= v.filesize;
	return p;
    }

    var reduceInitial = function() {
	return {
	    filesize : 0
	}
    }

    // Create the crossfilter for the relevant dimensions and groups.
    const data_xfilter = crossfilter(data_rows);
    globalCF = data_xfilter;
    // So we can display the total count of rows selected:
    const xfilter_all = data_xfilter.groupAll();  
    // Get the sum of data sizes
    //  *CWL* Note - apparently I cannot re-use xfilter_all here ... reduce()
    //     appears to apply some side-effect to the variable's contents and
    //     causes it to return NaNs if I tried.
    const xfilter_filesizeSum = 
	data_xfilter.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial);

    let x_filter_dimension = [];
    let x_filter_dimension_grouped = [];

    for(let i=0; i<XFILTER_PARAMS.num_display_fields; i++) {
        // First get what field goes in chart i
        let cur_data_field = XFILTER_PARAMS.charts[i];
        // Then lookup all the stuff about that field
        let cur_field_attrs = XFILTER_PARAMS.data_fields[cur_data_field];
        let cur_xfilter_dim = data_xfilter.dimension(d => d[cur_data_field]);

        // Add it to our list of x_filter dimensions
        x_filter_dimension.push(cur_xfilter_dim);

	// Use jQuery to create and append chart template
	$('#charts').append('<div id="chart' + i +'" class="chart">' +
			    '<div class="title"></div>' +
			    '</div>');
        // Add the title of the chart
        d3.selectAll("#chart"+String(i)+" .title").text(cur_field_attrs.display_name);

        let group_mapping;
        // Stratify the data into a few points for better analysis
        if("stratify" in cur_field_attrs) {
            let s = cur_field_attrs.stratify;
            group_mapping = (d => Math.floor(d / s) * s);
        } else {
            // Otherwise just do a passthrough mapping
            group_mapping = (d => d);
        }
        let dim_grouped = x_filter_dimension[i].group(group_mapping);
        x_filter_dimension_grouped.push(dim_grouped);
    }

    let chart_DOM_elements;

    // Renders the specified chart or list.
    function render(method) {
        d3.select(this).call(method);
    }

    // Re-rendering function, which we will later set to be trigged
    // whenever the brush moves and other events like that
    function renderAll() {
        chart_DOM_elements.each(render);
        resultsTable(x_filter_dimension[XFILTER_PARAMS.datasetview_chart_index]);
        d3.select('#active').text(formatWholeNumber(xfilter_all.value()));
	d3.select('#datasize').text(prettySize(xfilter_filesizeSum.value().filesize));
        d3.select('#genDataActive').text(formatWholeNumber(xfilter_all.value()));
	d3.select('#genDataDatasize').text(prettySize(xfilter_filesizeSum.value().filesize));
	reportExpectedDownloadSize();
        redraw_datasetview();
	// May be an overkill, we want to catch all scenarios where the URL list is
	//   invalidated by changes in crossfilter. Hence if the text area is open,
	//   it should be closed again.
	clearCrossfilterPreview();
	clearUrlList();
    }

    // *CWL* - I don't think we need this, and it adds unnecessary complexity to
    //    the data processing code.
    //    let updateDaySelection = createRadioButtons(data_xfilter, renderAll);

    // Create the datasetview widget, and obtain a callback function that
    // when called, refreshes the widget.
    var redraw_datasetview = createDataSetView(data_xfilter.size(), data_rows, x_filter_dimension[XFILTER_PARAMS.datasetview_chart_index]);

    // Create each chart with the proper scale and dimensions, and connect
    // them to the crossfilter data.
    const charts = []
    for(let i=0; i<XFILTER_PARAMS.num_display_fields; i++) {
        let cur_field = XFILTER_PARAMS.charts[i];
        let cur_attr = XFILTER_PARAMS.data_fields[cur_field];
        let cur_domain = [];

        // Use the data's extremes for our domain, unless the user has
        // overridden this.  e.g. hours forces domain to be [0, 24]
        if("domain" in cur_attr) {
            cur_domain = cur_attr.domain;
        } else {
            // If no override, just find the min and max of the actual data
            cur_domain = getExtremes(data_rows, cur_field);
        }

        let cur_chart_scale;

        // Decide if we have a linear or time scale
        if(cur_attr.scale == "linear") {
            cur_chart_scale = d3.scaleLinear();
        } else if (cur_attr.scale == "time") {
            cur_chart_scale = d3.scaleTime();
        } else {
            console.log("ERROR: no valid scale provided for " + cur_field);
        }

        let cur_chart = barChart(renderAll)
                .dimension(x_filter_dimension[i])
                .group(x_filter_dimension_grouped[i])
                .x(cur_chart_scale
                    .domain(cur_domain)
                    .rangeRound(cur_attr.rangeRound));
        
        charts.push(cur_chart);
    }


    // Given our array of charts, which we assume are in the same order as the
    // .chart elements in the DOM, bind the charts to the DOM and render them.
    // We also listen to the chart's brush events to update the display.
    chart_DOM_elements = d3.selectAll('.chart')
        .data(charts)

    // Render the total.
    d3.selectAll('#total')
        .text(formatWholeNumber(data_xfilter.size()));
    d3.selectAll('#genDataTotal')
        .text(formatWholeNumber(data_xfilter.size()));

    renderAll();

    window.filter = filters => {
        filters.forEach((d, i) => {
            charts[i].filter(d);
        });
        renderAll();
    };

    // This (window.resetAll) isn't used, therefore repurposed this to 
    // reset all filters by javascript triggered by a new "a" tag in the DOM
    window.resetAll = function() {
        // Remove the filters on all four charts
        let filters = [null, null, null, null];
        filters.forEach(function(d, i) { charts[i].filter(d); });

	// *CWL* - I don't think we need this
        // Passing true to updateDaySelection ensures the checkboxes are reset
	//        updateDaySelection(true);
        renderAll();
    };

    // Event handler for the "reset" buttons
    window.reset = i => {
        charts[i].filter(null);
        console.log("reset fired!");
        // DEBUG: somehow if you click reset, the results list does
        // not get refreshed.  Strange because we are calling renderAll
        // here...
        renderAll();
    };

}
