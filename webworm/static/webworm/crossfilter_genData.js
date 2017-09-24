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
