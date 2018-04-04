"use strict";

function createCrossfilterFeatureInput() {
    paramTable.rows({ selected: true }).every( function(index) {
	    var data = this.data();
	    $('#crossfilterFeatureInput').append('<input type="hidden" name="' +
						 data[0] + '_isFeature" value=""/>');
	});
}

function loading(isLoading, message) {
    if (!isLoading) {
	document.getElementById("loader").style.display = "none";
	document.getElementById("loaderText").style.display = "none";
	$('#loaderLabel').remove();
	document.getElementById("master").style.visibility = "visible";
    } else {
	window.scrollTo(0,0);
	document.getElementById("loader").style.display = "block";
	document.getElementById("loaderText").style.display = "block";
	$('#loaderText').append('<h2 id="loaderLabel">' + message + '</h2>');
	document.getElementById("master").style.visibility = "hidden";
    }
}

// Equivalent to python dict(zip(['AB', 'CD', 'EF', 'GH'],[1, 2, 3, 4])) in javascript
// Modified from: https://gist.github.com/ThomasG77/2186830
//
// *CWL* Not used, but retained in case it gets too expensive to ship dictionaries from
//   server to client.
function dict_zip(keys, dataTable) {
    let returnTable = [];
    let numRows = dataTable.length;
    if (numRows > 0) {
	for (var rowIdx=0; rowIdx<numRows; rowIdx++) {
	    let rowLen = dataTable[rowIdx].length;
	    if (keys.length === rowLen) {
		var dictionary = {};
		for (var i=0; i<rowLen; i++) {
		    dictionary[keys[i]] = dataTable[rowIdx][i];
		}
		returnTable.push(dictionary);
	    } else {
		console.log('Incompatible key and table column lengths at row ' + rowIdx);
	    }
	}
    }
    return returnTable;
}

function getUrl(zenodo_id, zenodo_filename) {
    let zenodo_url_prefix = 'https://zenodo.org/record/';
    let zenodo_download_url = zenodo_url_prefix + zenodo_id + '/files/' + zenodo_filename;
    return zenodo_download_url;
}

function getYoutubeUrlLink(youtube_id) {
    let url_link = '';
    if (youtube_id == 'None') {
	url_link = 'No YouTube Sample';
    } else {
	url_link = '<a target="_blank" href="https://youtu.be/' + youtube_id + 
	'">Youtube Sample</a>';
    }
    return url_link;
}

function getYoutubeEmbed(youtube_id) {
    let embedContent = '';
    if (youtube_id == 'None') {
	embedContent = 'No YouTube Sample found';
    } else {
	embedContent = 
	'<iframe type="text/html" width="160" height="90"' +
	' src="https://www.youtube.com/embed/' + youtube_id +
	'" frameborder="0"></iframe>';
    }
    return embedContent;
}

function augmentCrossfilterData(crossfilterData) {
    crossfilterData.forEach( function(row, rowIdx) {
	    // turn zenodo_id and zenodo_filename into a URL
	    row['url'] = getUrl(row['zenodo_id'], row['filename']);
	    // turn zenodo_filename into a file type string
	    //	    row['filetype'] = getFileType(row['filename']);
	    // turn 'None' filesize values to 0
	    if (row['filesize'] == 'None') {
		row['filesize'] = 0;
	    }
	    // turn youtube_id into a full embedding element.
	    //	    row['youtube'] = getYoutubeEmbed(row['youtube_id']);
	    row['youtube'] = getYoutubeUrlLink(row['youtube_id']);
	});

    return crossfilterData;
}

function prettySize(valueInBytes) {
    // within reason
    let scaleText = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB' ];
    let scaleIndex = 0;
    let val = valueInBytes;
    while (val >= 1000) {
	scaleIndex += 1;
	val /= 1000.0;
    }
    if (scaleIndex >= scaleText.length) {
	// Punt on prettying the text, something has to be horribly wrong to exceed Exabytes
	return valueInBytes + " Bytes";
    } else {
	return val.toPrecision(4) + " " + scaleText[scaleIndex];
    }
}

var pretty_month_names = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
			   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

function parseDate(d) {
    // Parse the date.
    // (this function is like d3.time.format, but faster)
    return new Date(d.substring(0,4),
	d.substring(4, 6) - 1,
        d.substring(6, 8),
        d.substring(8, 10),
        d.substring(10, 12));
}

function ts_getYear(timestamp) {
    return (timestamp.substring(0,4));
}

function ts_getMonth(timestamp) {
    return (timestamp.substring(4,6));
}

function ts_getDate(timestamp) {
    return (timestamp.substring(6,8));
}

function ts_getHour(timestamp) {
    let hour = parseInt(timestamp.substring(8,10));
    let minutes = parseInt(timestamp.substring(10,12));
    return (hour + minutes/60.0).toString();
}

function ts_prettyDate(timestamp) {
    let month = parseInt(ts_getMonth(timestamp));
    let suffix = "th";
    let day = parseInt(ts_getDate(timestamp));
    let digit = day%10;
    if (digit == 1) {
	if (Math.floor(day/10) != 1) { 
	    suffix = "st";
	}
    } else if (digit == 2) {
	if (Math.floor(day/10) != 1) { 
	    suffix = "nd";
	}
    } else if (digit == 3) {
	if (Math.floor(day/10) != 1) { 
	    suffix = "rd";
	}
    }
    return pretty_month_names[month-1] + " " + day.toString() + suffix +
	" " + ts_getYear(timestamp);
}

function ts_prettyTime(timestamp) {
    let hour = parseInt(timestamp.substring(8,10));
    let minutes = timestamp.substring(10,12);
    let pretty_hour = "";
    let half = "am";
    if (hour > 12) {
	hour = hour - 12;
	half = "pm";
    } else {
	if (hour == 12) {
	    half = "pm";
	}
    }
    return  hour.toString() + ":" + minutes + half;
}

// Various formatters.
var formatWholeNumber = d3.format(",d"),
    formatChange = d3.format("+,d");

function valueFormatted(d, field_name) {
    // Prepare a given value for display

    var cur_item = XFILTER_PARAMS.data_fields[field_name];
    var value = d[field_name];
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


function getExtremes(data_rows, field_name) {
    // Obtain the [min, max] scalar values from the data, for a given
    // column (aka field)
    const cur_min = d3.min(data_rows, function(d) { return +d[field_name]});
    const cur_max = d3.max(data_rows, function(d) { return +d[field_name]});

    return [cur_min, cur_max];
}

// Create an initialized parameter object with static fields and information
//   built-in.
function initializeParamObject() {
    var returnObject = {};
    returnObject['report_title'] = "Crossfilter Selected Experiments";
    // *CWL* This hardcode of 2 display fields depends on the nature of the static fields
    //    and needs to be generalized. Am thinking the server will send
    //    an appropriate number corresponding to the static fields.
    // returnObject['num_display_fields'] = 2;
    returnObject['num_display_fields'] = 2;
    returnObject['data_fields'] = {};
    returnObject['data_fields']['timestamp'] = { "data_type": "string",
						 "display_name": "Date / Time",
						 "suffix": "",
						 "scale": "linear",
						 "bucket_width": 1 };
    returnObject['data_fields']['hour'] = { "data_type": "numeric",
					    "display_name": "Hour of day",
					    "suffix": "",
					    "scale": "linear",
					    "bucket_width": 10,
					    "domain": [0, 24],
					    "rangeRound": [0, 240] };
    returnObject['data_fields']['iso_date'] = { "data_type": "iso_date",
						"display_name": "Experiment Date",
						"suffix": "",
						"scale": "time",
						"bucket_width": 1,
						"rangeRound": [0, 900] };
    returnObject['data_fields']['pretty_date'] = { "data_type": "string",
						   "display_name": "Date",
						   "suffix": "",
						   "scale": "linear",
						   "bucket_width": 1 };
    returnObject['data_fields']['pretty_time'] = { "data_type": "string",
						   "display_name": "Time",
						   "suffix": "",
						   "scale": "linear",
						   "bucket_width": 1 };
    returnObject['data_fields']['base_name'] = { "data_type": "string",
					      "display_name": "Experiment Name" };
    returnObject['data_fields']['strain'] = { "data_type": "string",
					      "display_name": "Strain" };
    returnObject['data_fields']['gene'] = { "data_type": "string",
					      "display_name": "Gene" };
    returnObject['data_fields']['allele'] = { "data_type": "string",
					      "display_name": "Allele" };
    returnObject['data_fields']['zenodo_id'] = { "data_type": "string",
					   "display_name": "Zenodo Id" };
    returnObject['data_fields']['filename'] = { "data_type": "string",
					   "display_name": "File Type" };
    returnObject['data_fields']['numfiles'] = { "data_type": "numeric",
					   "display_name": "Num Files" };
    returnObject['data_fields']['filesize'] = { "data_type": "numeric",
					   "display_name": "File Size" };
    returnObject['data_fields']['filetype'] = { "data_type": "string",
					   "display_name": "File Type" };
    returnObject['data_fields']['url'] = { "data_type": "string",
    					   "display_name": "File Download URL" };
    returnObject['data_fields']['youtube_id'] = { "data_type": "string",
    					   "display_name": "YouTube ID" };
    returnObject['data_fields']['youtube'] = { "data_type": "html_embed",
    					   "display_name": "YouTube Sample" };
    returnObject['data_fields']['days_of_adulthood'] = { "data_type": "numeric",
							 "display_name": "Days of Adulthood",
							 "suffix": "",
							 "scale": "linear",
							 "bucket_width": 1,
							 "rangeRound": [0, 300] };
    //    returnObject['charts'] = [ "iso_date", "hour" ];
    returnObject['charts'] = [ 
			      "iso_date",
			      "days_of_adulthood",
			       ];
    returnObject['results_display'] = [ 
				       "youtube",
				       "strain",  
				       "gene",
				       "allele",
				       "pretty_date",
				       "pretty_time", 
				       "zenodo_id",
				       "numfiles",
				       "filesize",
				       "days_of_adulthood",
					];
    returnObject['max_results'] = 20;
    return returnObject;
}

function createXfilterParams(paramObject, rawInputData) {
    // Reinitialize the existing default object.
    let numSelectedFeatures = selectedFeaturesNames.length;
    paramObject = initializeParamObject();
    paramObject['num_display_fields'] = paramObject['num_display_fields'] + 
	numSelectedFeatures;
    paramObject['datasetview_chart_index'] = paramObject['num_display_fields'] - 1;
    for (var i=0; i<numSelectedFeatures; i++) {
	let fieldName = selectedFeaturesNames[i];
	// *CWL* Keeping this around in case I still need to use it.
	//	let fieldRange = getExtremes(rawInputData, fieldName);
	paramObject['data_fields'][fieldName] = { 
	    "data_type": "numeric",
	    "display_name": fieldName,
	    "suffix": "",
	    "scale": "linear",
	    "bucket_width": 1,
	    "rangeRound":[0,$('#crossfilterPane').width()/3.5],
	    "stratify": 1
	};
	paramObject['charts'].push(fieldName);
	paramObject['results_display'].push(fieldName);
    }
    return paramObject;
}

function generateXfilterDerivedColumns(rawInputData) {
    for (var rowIdx=0; rowIdx < rawInputData.length; rowIdx++) {
	let dataRow = rawInputData[rowIdx];
	let timestamp = dataRow['timestamp'];
	let rowDate = parseDate(timestamp);
	dataRow['hour'] = ts_getHour(timestamp);
	dataRow['iso_date'] =  ts_getYear(timestamp) + "-" +
	    ts_getMonth(timestamp) + "-" +
	    ts_getDate(timestamp);
	//	dataRow['pretty_date'] = rowDate.toDateString();
	dataRow['pretty_date'] = ts_prettyDate(timestamp);
	//	dataRow['pretty_time'] = rowDate.toTimeString();
	dataRow['pretty_time'] = ts_prettyTime(timestamp);
    }
}

function createDataSetView(data_xfilter_size, data_rows, dataset_group_dimension) {
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

            // DEBUG: remove hardcoding
            var labelText = "idx: " + index + ".";
           // var labelText = labelText = "Selected: " + item.selected + ", Date: " + item.pretty_date + " " + item.pretty_time + ", Delay: ";
            //labelText += item.delay + ", Distance: " + item.distance + ", Route: " + item.origin + "-->" + item.destination + " (idx: " + index + ")";
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
        let rows_selected = dataset_group_dimension.top(Infinity);

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
// *CWL* - This is a test feature. Retained for reference
//  only.
function createRadioButtons(data_xfilter, renderAll) {

    const radio_button_grouping_field = XFILTER_PARAMS.radio_button_grouping_field;

    // Add new day dimension
    var dayNumber = data_xfilter.dimension(function(d) {
        return d[radio_button_grouping_field];
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

            updateDaySelection(false);
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

            updateDaySelection(false);
            renderAll();
        })


    // Update the state of the day selection radio buttons and checkboxes
    // (called after "change" events from those elements)
    function updateDaySelection(doReset) {
        if(doReset) {
            Object.keys(days).forEach(function(d) { days[d].state = true });
        }

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

function resultsTable(grouping_dimension) {
    // Re-run the results list, by erasing it and creating it again

    let div = d3.select("#results-list");
    // Clear the existing results
    div.selectAll("table").remove();

    // Create a table with one row for each record in the crossfilter construct
    let table = div.append("table").attr("class", "display").attr("class","nowrap")
	.attr("border",1);
    let tableHead = table.append("thead").append("tr");
    let tableBody = table.append("tbody");
    let trs = tableBody.selectAll("tr").data(grouping_dimension.top(XFILTER_PARAMS.max_results))
        .enter().append("tr");
    /*
    let trs = tableBody.selectAll("tr").data(grouping_dimension.top(Infinity))
        .enter().append("tr");
    */

    // Loop over all columns we are supposed to display in the results
    for(let len = XFILTER_PARAMS.results_display.length, i=0; i<len; i++) {
        let cur_field = XFILTER_PARAMS.results_display[i];

        tableHead.append("td").html(XFILTER_PARAMS.data_fields[cur_field].display_name);
        trs.append("td").html(d => valueFormatted(d, cur_field));
    }
}
