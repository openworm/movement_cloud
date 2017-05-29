// WCON Viewer
// Views a WCON file, showing all its metadata and the path of the worm
// WORM PETRI DISH VISUALIZATION CODE
// sets up a d3.timer within the svg element of the wormVisualization div.
//////////////
let wcon_objj; // DEBUG used for debugging

const wcon_file_name = "smaller.wcon";

// Load the worm schema, and use this information to render some explanation
// of what the WCON format is
d3.json(WORMVIZ_PARAMS.schema_url, function(error1, schema_obj) {
    // Load this specific WCON file
    d3.json(wcon_file_name, function(error2, wcon_obj) {
        if (error1) { console.log(error1); }
        if (error2) { console.log(error2); }

        // VALIDATE WCON FILE AGAINST SCHEMA    
        //let ajv = new Ajv();
        //var validate = ajv.compile(schema_obj);

        // FILE INFORMATION    
        let file_info = d3.select("#file_info");
    
        file_info.append("div")
            .attr("class", "file_info")
            .text("File name: " + String(wcon_file_name));
    
        file_info.append("div")
            .attr("class", "validation_state")
            .text("Validation state: " + "UNKNOWN");
        
        // WCON FILE INFORMATION
        display_wcon(wcon_obj); 

        // FOOTER
        let footer = d3.select("#footer");
    
        footer.insert("div",".links").attr("class", "title")
            .append("h3").text(schema_obj.title);
    
        footer.insert("div",".links").attr("class", "description")
            .append("p").text(schema_obj.description);
    });
});


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
    wcon_objj = wcon_obj;  // DEBUG

    // Show metadata in a nice syntax-highlighed JSON block.
    d3.select("#metadata").append("div")
        .attr("class", "metadata")
        .append("pre")
            .node().innerHTML = syntaxHighlight(wcon_obj.metadata);

    // Show units in a table.
    let units_pivoted = pivot_object(wcon_obj.units, "dimension", "units");
    tabulate(d3.select("#units"), units_pivoted, ["dimension", "units"]);

    // Animate the worm's data
    create_worm_animation(wcon_obj.data);
}

