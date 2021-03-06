/* 

WCON Viewer

Views a WCON file, showing all its metadata and the path of the worm
WORM PETRI DISH VISUALIZATION CODE
sets up a d3.timer within the svg element of the wormVisualization div.

TODO: If there is a "files" entry, warn that this parser is not grabbing it.
Ask the user to run the WCON file through the Python parser to fix.
* Ask the user to run the WCON file through e.g. the Python parser to fix.

TODO: If worms_ids.length < wcon_obj.data.length, then at least one
      worm's "tracks" are being split over two or more wcon_obj.data
      entries and again this parser cannot handle that.
* Ask the user to run the WCON file through e.g. the Python parser to fix.

TODO: Warn that unzipping cannot be handled, or else just handle it!
      You can use (https://gildas-lormeau.github.io/zip.js/) perhaps.

*/

// Initialize the page with an example
view_WCON_data_file(WORMVIZ_PARAMS.initial_WCON_data_file);

function clear_WCON_view() {
    /* Clear all existing DOM elements used to display WCON information,
       so that a new worm can be displayed. */

    // Stop any existing animations
    d3.timerFlush();
    stop_animation();

    // Clear previous results (if any)
    d3.select("#file_info").selectAll("*").remove();

    // Clear any previous results
    d3.select("#wormVisualization").selectAll("svg").selectAll("*").remove()
    d3.select("#wormDropDownMenu").selectAll("*").remove()
    d3.select("#metadata").selectAll("*").remove()
    d3.select("#units").selectAll("*").remove()
    d3.select("#data_info").selectAll("*").remove()
}

function view_WCON_data_file(WCON_data_file) {
    /*
        This method loads the schema and worm data, validates it
        against the schema, and displays the WCON file.
    */
    // Clear the existing view
    clear_WCON_view();
    console.log("Loading file: " + WCON_data_file);
    d3.select("#file_info").append("div")
        .attr("class", "file_info")
        .text("LOADING FILE, PLEASE WAIT...");

    // Load the WCON schema
    d3.json(WORMVIZ_PARAMS.schema_url, function(error1, schema_obj) {
        // Load this specific WCON file
        d3.json(WCON_data_file, function(error2, wcon_obj) {
            if (error1) { console.log(error1); }
            if (error2) { console.log(error2); }

            // Clear the existing view    
            clear_WCON_view();

            // FILE INFORMATION    
            let file_info = d3.select("#file_info");
        
            // Display the file name
            file_info.append("div")
                .attr("class", "file_info")
                .text("File name: " + String(WCON_data_file));
    
            let validation_state = file_info.append("div")
                    .attr("class", "validation_state")
    
        
            // VALIDATE WCON FILE AGAINST SCHEMA    
            let isValidWCON = false;
            let ajv = new Ajv();
            if (!ajv.validate(schema_obj, wcon_obj)) {
                isValidWCON = false;
    
                // If it did not validate, show the errors
                validation_state
                    .append("h3").attr("class", "bad").text("SCHEMA VALIDATION ERRORS:")
                    .append("pre")
                        .node().innerHTML = syntaxHighlight(ajv.errors);
            } else {
                isValidWCON = true;
    
                validation_state
                        .append("span").text("Validation state: ")
                        .append("span").attr("class", "good").text("VALIDATED");
            }
    
            // Only show the WCON information if the previous schema test
            // passed, or if we've given permission to try to display
            // despite the schema not validating.
            if(isValidWCON || WORMVIZ_PARAMS.display_despite_schema_errors) {
                // WCON FILE INFORMATION
                display_wcon(wcon_obj);
            }
        });
    });
}

function view_WCON_json(filename, wcon_obj) {
    clear_WCON_view();
    console.log("Loading file: " + filename);
    d3.select("#file_info").append("div")
        .attr("class", "file_info")
        .text("LOADING FILE, PLEASE WAIT...");

    // Load the WCON schema
    d3.json(WORMVIZ_PARAMS.schema_url, function(error1, schema_obj) {
            // FILE INFORMATION    
            let file_info = d3.select("#file_info");
	    
            // Display the file name
            file_info.append("div")
                .attr("class", "file_info")
                .text("File name: " + String(filename));
	    
            let validation_state = file_info.append("div")
		.attr("class", "validation_state")
		
	    // VALIDATE WCON FILE AGAINST SCHEMA    
	    let isValidWCON = false;
            let ajv = new Ajv();
            if (!ajv.validate(schema_obj, wcon_obj)) {
                isValidWCON = false;
    
                // If it did not validate, show the errors
                validation_state
                    .append("h3").attr("class", "bad").text("SCHEMA VALIDATION ERRORS:")
                    .append("pre")
                        .node().innerHTML = syntaxHighlight(ajv.errors);
            } else {
                isValidWCON = true;
    
                validation_state
                        .append("span").text("Validation state: ")
                        .append("span").attr("class", "good").text("VALIDATED");
            }
    
            // Only show the WCON information if the previous schema test
            // passed, or if we've given permission to try to display
            // despite the schema not validating.
            if(isValidWCON || WORMVIZ_PARAMS.display_despite_schema_errors) {
                // WCON FILE INFORMATION
                display_wcon(wcon_obj);
            }
    })
;}

function canonical_time_unit(unit) {
    unitMap = { 
	"nanoseconds": "ns",
	"nanosecond": "ns",
	"microseconds": "us",
	"microsecond": "us",
	"milliseconds": "ms",
	"millisecond": "ms",
	"second": "s",
	"sec": "s",
	"minute": "min",
	"hour": "h",
	"day": "d",
    }
    if (unit in unitMap) {
	return unitMap[unit];
    } else {
	// Unrecognized time unit, punt.
	return unit;
    }
}

function time_in_seconds(unit, value) {
    timeMap = { 
	"ns": 0.000000001,
	"us": 0.000001,
	"ms": 0.001,
	"s": 1.0,
	"min": 60.0,
	"h": 3600.0,
	"d": 86400.0,
    };
    if (unit in timeMap) {
	return value * timeMap[unit];
    } else {
	// Unrecognized time unit, punt.
	return value;
    }
}

function display_wcon(wcon_obj) {
    /* 
        This method renders on the page the WCON object's 
        data, units, and metadata elements.

        TODO: check if "files" is present, and pop-up a warning that
        this parser cannot handle it, suggest running it through
        Python first.

        TODO: check for any custom fields, and list them and mention
        that this parser will not show them.
    */
    // Show metadata in a nice syntax-highlighed JSON block.
    d3.select("#metadata").append("div")
        .attr("class", "metadata")
        .append("pre")
            .node().innerHTML = syntaxHighlight(wcon_obj.metadata);

    // Show units in a table.
    let units_pivoted = pivot_object(wcon_obj.units, "dimension", "units");
    tabulate(d3.select("#units"), units_pivoted, ["dimension", "units"]);


    // Obtain a list of all unique worm ids
    let worm_ids = [];
    let new_data = [];
    let new_data_map = {};

    // Merge multiple ID entries into one.
    //   *CWL* - Will do something about the ugly code later.
    for (let i=0; i<wcon_obj.data.length; i++) {
	if (wcon_obj.data[i].id in new_data_map) {
	    for (let j=0; j<wcon_obj.data[i].t.length; j++) {
		new_data_map[wcon_obj.data[i].id].push([
							wcon_obj.data[i].t[j],
							wcon_obj.data[i].x[j],
							wcon_obj.data[i].y[j],
							]
						       );
	    }
	} else {
	    new_data_map[wcon_obj.data[i].id] = [];
	    for (let j=0; j<wcon_obj.data[i].t.length; j++) {
		new_data_map[wcon_obj.data[i].id].push([
							wcon_obj.data[i].t[j],
							wcon_obj.data[i].x[j],
							wcon_obj.data[i].y[j],
							]
						       );
	    }
	}
    }
    // Spit out new data structure. Note that the time stamps have to be
    //   sorted because this parser assumes that.
    for (let wormid in new_data_map) {
	let new_rec = {};
	new_rec.id = wormid;
	new_data_map[wormid].sort(function (a,b) {
		if (a[0] < b[0]) return -1;
		if (a[0] > b[0]) return 1;
		return 0;
	    });
	new_rec.t = new_data_map[wormid].map(function (row) {
		return row[0];
	    });
	new_rec.x = new_data_map[wormid].map(function (row) {
		return row[1];
	    });
	new_rec.y = new_data_map[wormid].map(function (row) {
		return row[2];
	    });
	new_data.push(new_rec);
    }
    //    console.log(new_data);

    // *CWL* - Hack. Replace original data
    wcon_obj.data = new_data;

    wcon_obj.data.map(d => worm_ids.push(d.id));
    let unique_worm_ids = worm_ids.filter(onlyUnique);

    let data_info = d3.select("#data_info");
    data_info.append("div")
        .attr("class", "worm_ids")
        .text("List of worm IDs: " + unique_worm_ids.toString());

    if(unique_worm_ids.length !== wcon_obj.data.length) {
        // This parser cannot handle the same worm split over multiple tracks
        data_info.append("div")
            .attr("class", "too_many_tracks_error")
                .append("span").attr("class", "bad")
                .text("ERROR: There are " + String(worm_ids.length) +
                      " unique worm IDs but the data array's length is " + 
                      String(wcon_obj.data.length) + ", when this parser " + 
                      "requires they be equal. As it stands, at " +
                      "least one worm's 'tracks' are being split over two " +
                      "or more wcon_obj.data entries and again this parser " +
                      "cannot handle that.  Please run the WCON file " + 
                      "through another parser such as the Python parser " + 
                      "to simplify the file, and then reload here.");
    }

    // FRAME RATE
    // Assumes units are xs, where x is some scalar.
    // *CWL* - NOTE: This will not handle all supported forms of WCON.
    let frame_rate = parseFloat(wcon_obj.units.t.slice(0, -1));
    // If the units were just "s", frame rate should be 1 frame / second.
    if (isNaN(frame_rate)) {
        frame_rate = 1.0;
    } else {
        // Convert from seconds per frame to the more familiar fps.
        frame_rate = 1 / frame_rate;
    }

    /* Take wcon_obj.data.t[1] / wcon_obj.data.t[0] as the frame rate, but
        it might vary frame-by-frame, so it's not clear how to show the
        frame rate; I suppose we could show minimum and maximum frame rate.
    */
    /*
    data_info.append("div")
        .attr("class", "frame_rate")
            .append("span")
            .text("Frame rate: " + frame_rate + " frames per second");
    */

    // TRACKS COUNT DATA
    // Go through all tracks and grab the length of t and other data
    let wcon_data_info = [];
    for(let i=0; i<wcon_obj.data.length; i++) {
        wcon_data_info.push({
            "ID": wcon_obj.data[i].id,
            "Number of Frames": wcon_obj.data[i].t.length,
		//            "Seconds of footage": wcon_obj.data[i].t.length * (1/frame_rate),
            "Seconds of footage": 
		time_in_seconds(canonical_time_unit(wcon_obj.units.t),
				wcon_obj.data[i].t[wcon_obj.data[i].t.length-1]),
            "Data Types": Object.keys(wcon_obj.data[i]).toString(),
            "x Min Articulation Pts": d3.min(wcon_obj.data[i].x.map(d => d.length)).toString(),
            "x Max Articulation Pts": d3.max(wcon_obj.data[i].x.map(d => d.length)).toString(),
            "y Min Articulation Pts": d3.min(wcon_obj.data[i].y.map(d => d.length)).toString(),
            "y Max Articulation Pts": d3.max(wcon_obj.data[i].y.map(d => d.length)).toString(),
        });
    }
    let wcon_data_columns = Object.keys(wcon_data_info[0]);
    // Put this information in a nice useful table
    tabulate(d3.select("#data_info"), wcon_data_info, wcon_data_columns);

    // Animate the worm's data
    create_worm_animation(d3.select("#wormVisualization"),
                          wcon_obj.data[0], wcon_obj.units);

    // Allow a choice of unique_worm_ids
    d3.select("#worm_picker").selectAll("select")
        // First selectAll from the non-existent "option" list otherwise
        // .enter will miss the first array element
        .selectAll("option")
        .data(worm_ids).enter()
            .insert("option")
            .attr("value", (d, i) => String(i))
            .text((d, i) => d)
            // Let's select the first item by default
            .attr("selected", (d, i) => (i === 0) ? "selected" : null);

    // Now listen for changes to the worm selection list
    let selectList = document.getElementById("wormDropDownMenu");
    function worm_picker_selection_made(changeEvent) {
        console.log(selectList.value);

        // Restart the worm animation with the new worm choice
        create_worm_animation(d3.select("#wormVisualization"),
                              wcon_obj.data[selectList.value],
                              wcon_obj.units)
    }
    if(document.readyState === 'complete') {
        selectList.addEventListener("change", worm_picker_selection_made);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            selectList.addEventListener("change", worm_picker_selection_made);
        });
    }
}
