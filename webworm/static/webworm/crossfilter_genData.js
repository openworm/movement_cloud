var xFilterFeaturesTable;

$(document).ready(function() {
	
	xFilterFeaturesTable = $('#xFilterFeaturesTable').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
	                  {
			      text: 'Select Searched',
			      action: function (e, dt, node, config) {
				  dt.rows({search:'applied'}).select();
			      }
			  },
	                  {
			      text: 'Deselect Searched',
			      action: function (e, dt, node, config) {
				  dt.rows({search:'applied'}).deselect();
			      }
			  },			  
			  ],
		select: {
		    style: 'multi'
		},
	    });

	$('#genDataFeaturesSelected').text(formatWholeNumber(xFilterFeaturesTable.rows('.selected').count()));
	$('#genDataFeaturesTotal').text(formatWholeNumber(allFeaturesNames.length));

	xFilterFeaturesTable.on( 'select', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var selectLength = indexes.length;
		}
		$('#genDataFeaturesSelected').text(formatWholeNumber(dt.rows('.selected').count()));
	    } );

        xFilterFeaturesTable.on( 'deselect', function ( e, dt, type, indexes ) {
                if ( type === 'row' ) {
                    var selectLength = indexes.length;
                }
		$('#genDataFeaturesSelected').text(formatWholeNumber(dt.rows('.selected').count()));
            } );
    });


// *CWL* - This is no longer required given the latest version of the database.
//   This was used to strip out the ID from the older format in the form of
//   xxxxx#yyyyyyyyy where yyyyyyyyy is some text string. This code is retained
//   as reference.
function stripZenodoId(inId) {
    let outId = inId.substring(0,inId.indexOf("#"));
    return outId;
}

// *CWL* - This is the basic form of getting results from Zenodo. A more
//   advanced form may take the list and perform post-processing like 
//   allowing the user to choose the element(s) (e.g. Video data only)
//   to actually be downloaded. In the latter case, we'd want to separate
//   the common feature of extracting the specific URLs as its own function.
//
// 2017/9/1 This version will produce a dummy list (real zenodo IDs, fake URL) 
//   in a format that will support
//   the use of a linux script to aid with the download in a separate phase.
function downloadResultsList() {
    var returnText = "";
    // *CWL* - Point of Code Fragility. These values DEPEND on the type values
    //         delivered from the server. If one changes without the other,
    //         this code fails.
    let zenodoFileTypes = { 'Video':'chk_fullvid',
			    'WCON':'chk_wcon',
			    'Features':'chk_features',
			    'Skeleton':'chk_skeleton',
			    'Sample':'chk_vidsample'
                          };
    let zenodoUrlPrefix = 'https://sandbox.zenodo.org/records';
    // Get grouping by Zenodo Id
    let allCFValues = globalCF.dimension(d => d.zenodo_id).top(Infinity);
    for (var idx=0; idx<allCFValues.length; idx++) {
	let downloadUrl = allCFValues[idx].url;
	let zenodoId = allCFValues[idx].zenodo_id;
	let fileType = allCFValues[idx].filetype;
	if (downloadUrl != 'None') {
	    if ($('#' + zenodoFileTypes[fileType])[0].checked) {
		returnText = returnText + zenodoId + " " + downloadUrl + "\n";
	    }
	}
    }
    if (returnText == "") {
	alert("Download Warning: No records found!\n");
    } else {
	var zip = new JSZip();
	zip.file("movement_data_download_package/Readme.md", 
		 'Change permissions of download_zenodo.sh first - chmod 755 download_zenodo.sh\n' +
		 'Usage: ./download_zenodo.sh <data file> <output folder>\n');
	// A serious hack ... quick-and-dirty first-cut to avoid having to work with serving
	//   static text files from Django.
	zip.file("movement_data_download_package/download_zenodo.sh",
		 '#!/bin/bash\n' +
		 'if [ "$#" -ne 2 ];\n' +
		 'then\n' +
		 '  echo "download_zenodo.sh <data list file> <download folder>";\n' +
		 '  exit -1;\n' +
		 'fi\n' +
		 'input="$1"\n' +
		 'output="$2"\n' +
		 'mkdir -p "$output"\n' +
		 'while read id url\n' +
		 'do\n' +
		 '  echo $id $url\n' +
		 '  newdir="$output/$id"\n' +
		 '  mkdir -p $newdir\n' +
		 '  pushd $newdir\n' +
		 '  wget -t0 -c $url\n' +
		 '  popd\n' +
		 'done < "$input"\n' +
		 'echo "----- Script Complete -----"\n');
	zip.file("movement_data_download_package/download_files.txt", returnText);
	zip.generateAsync({type:"blob"})
	    .then(function(content) {
		    // see FileSaver.js
		    saveAs(content, "movement_data_download_package.zip");
		});
	/* *CWL* OLD Click-Download code. Keeping for reference.
	  var element = document.createElement('a');
	  element.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(returnText));
	  element.setAttribute('download', 'results.txt');
	  element.style.display = 'none';
	  document.body.appendChild(element);
	  element.click();
	  document.body.removeChild(element);
	*/
    }
}

function getCsvFromResults() {
    $('#metadataInput').append('<input type="hidden" id="downloadTag" name="download" value="">');
    // Stub for getting chart ranges - to be delivered back via GET request
    XFILTER_PARAMS['charts'].forEach( function(dimension) {
	    // insert hidden input
	    let minSuffix = '_f_min';
	    let maxSuffix = '_f_max';
	    // special treatment for non-feature charts
	    if ((dimension == 'iso_date') || (dimension == 'hour')) {
		minSuffix = '_dl_min';
		maxSuffix = '_dl_max';
	    }
	    $('#metadataInput').append('<input type="hidden" id="' + 
				       dimension + minSuffix + '_InputList" name="' +
				       dimension + minSuffix + '" value=""/>');
	    $('#metadataInput').append('<input type="hidden" id="' + 
				       dimension + maxSuffix + '_InputList" name="' +
				       dimension + maxSuffix + '" value=""/>');
	    let minValue = globalCF.dimension(d => d[dimension]).bottom(1)[0][dimension];
	    let maxValue = globalCF.dimension(d => d[dimension]).top(1)[0][dimension];
	    if (dimension == 'iso_date') {
		minValue = isoToYMD(minValue);
		maxValue = isoToYMD(maxValue);
	    }
	    $('#'+dimension+minSuffix+'_InputList').val(minValue);
	    $('#'+dimension+maxSuffix+'_InputList').val(maxValue);
	});
    // Deliver filtered features via GET request
    xFilterFeaturesTable.rows({selected: true}).every( function(rowIdx, tblLoop, rowLoop) {
	    let feature = this.data()[0];
	    $('#metadataInput').append('<input type="hidden" id="meta_dl_' +
				       feature + '" name="' +
				       feature + '_isDownload" value=""/>');
	});
    
    // Deliver previous Advanced filter GET request if appropriate.
    for (var key in prevAdvancedFilterState) {
	if (key == 'filteredFeatures') {
	    for (var feature in prevAdvancedFilterState['filteredFeatures']) {
		$('#metadataInput').append('<input type="hidden" id="meta_' +
					   feature + '" name="' +
					   feature + '_isFeature" value=""/>');
	    }
	} else if (key == 'start_date') {
	    $('#metadataInput').append('<input type="hidden" id="meta_start_date" ' +
				       'name="start_date" value="' +
				       prevAdvancedFilterState['start_date'] + '"/>');
	} else if (key == 'end_date') {
	    $('#metadataInput').append('<input type="hidden" id="meta_end_date" ' +
				       'name="end_date" value="' +
				       prevAdvancedFilterState['end_date'] + '"/>');
	} else {
	    // discrete lists
	    createDiscreteHiddenInput('#metadataInput');
	}
    }
    $('#metadataForm').submit();
}

function isoToYMD(inDate) {
    date = new Date(inDate);
    year = date.getFullYear();
    month = date.getMonth()+1;
    dt = date.getDate();
    if (dt < 10) {
	dt = '0' + dt;
    }
    if (month < 10) {
	month = '0' + month;
    }
    return year + '-' + month + '-' + dt;
}

function generateDownloadData() {
    // produce CSV from newly constructed array
    let csvContent = '';
    let headerCsv = downloadHeaders.join(',');
    csvContent += headerCsv + "\n";
    downloadData.forEach( function(row, index) {
	    let csvRow = row.join(',');
	    csvContent += csvRow + "\n";
	});

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(csvContent));
    element.setAttribute('download', 'results.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element); 
}

function getCsvFromResults_______2() {
    let data = globalCF.dimension(d => d.zenodo_id).top(Infinity);
    let filteredFeatures = [];
    xFilterFeaturesTable.rows({selected: true}).every( function(rowIdx, tblLoop, rowLoop) {
	    filteredFeatures.push(this.data());
	});

    let zenodoIDs = {};
    let newdata = [];
    // Start with fixed headers
    let header = ['strain','gene','allele','base_name','zenodo_id'];
    filteredFeatures.forEach( function(feature, index) {
	    header.push(feature);
	});

    // Remove rows with the same zenodoId, choose columns that show up in header
    data.forEach( function(inner, index) {
	if (inner['zenodo_id'] != 'None') {
	    if (zenodoIDs[inner['zenodo_id']] == null) {
		zenodoIDs[inner['zenodo_id']] = 'Y';
		let newRow = [];
		header.forEach( function(key, index) {
			newRow.push(inner[key]);
		    });
		newdata.push(newRow);
	    }
	} else {
	    // If there is no zenodo ID, just add the row.
	    let newRow = [];
	    header.forEach( function(key, index) {
		    newRow.push(inner[key]);
		});
	    newdata.push(newRow);
	}
	});

    // produce CSV from newly constructed array
    let csvContent = '';
    let headerCsv = header.join(',');
    csvContent += headerCsv + "\n";
    newdata.forEach( function(row, index) {
	    let csvRow = row.join(',');
	    csvContent += csvRow + "\n";
	});

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(csvContent));
    element.setAttribute('download', 'results.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element); 
}

function genDataTable(grouping_dimension) {
    // Re-run the results list, by erasing it and creating it again

    let div = d3.select("#xfilter-genData-list");
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
