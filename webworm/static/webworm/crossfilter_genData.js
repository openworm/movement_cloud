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
    let zenodoUrlPrefix = 'https://sandbox.zenodo.org/records';
    // Get grouping by Zenodo Id
    let allCFValues = globalCF.dimension(d => d.zenodo_id).top(Infinity);
    for (var idx=0; idx<allCFValues.length; idx++) {
	let downloadUrl = allCFValues[idx].url;
	let zenodoId = allCFValues[idx].zenodo_id;
	let fileType = allCFValues[idx].filetype;
	if (downloadUrl != 'None') {
	    if ($('#chk_' + fileType).is(':checked')) {
		returnText = returnText + zenodoId + "\t" + downloadUrl + "\n";
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
		 'while IFS=$\'\\t\' read -r id url\n' +
		 'do\n' +
		 '  echo $id $url\n' +
		 '  newdir="$output/$id"\n' +
		 '  mkdir -p $newdir\n' +
		 '  pushd $newdir\n' +
		 '  WGETCMD="wget -t0 -c \'"$url"\'"\n' +
		 '  eval "$WGETCMD"\n' +
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

function generateFileTypeCheckboxes() {
    let columnsPerRow = 6;
    let rowIdx = 0;
    for (var i=0; i<fileTypes.length; i++) {
	if (i%columnsPerRow == 0) {
	    rowIdx += 1;
	    $('#filetypeCheckboxes').append('<div class="row" id="filetypeChkRow_' +
					    rowIdx + '"></div>');
	}
	$('#filetypeChkRow_' + rowIdx).append('<div class="col-sm-2"> ' +
					      '<div class="checkbox active"> ' +
					      '<label><input type="checkbox" id="chk_' +
					      fileTypes[i] + '" checked="checked" value="">' +
					      fileTypes[i] + '</label>' +
					      '</div></div>');
	$('#chk_' + fileTypes[i]).change(function() {
		// Update the expected download size information
		reportExpectedDownloadSize();

		// Update active URL List text area if it exists
		if ($('#urlList').length !== 0) {
		    getUrlList();
		}
	    });
    }
}

function reportExpectedDownloadSize() {
    let allCFValues = globalCF.dimension(d => d.zenodo_id).top(Infinity);
    let total = 0;
    for (var idx=0; idx<allCFValues.length; idx++) {
	let downloadUrl = allCFValues[idx].url;
	let filesize = allCFValues[idx].filesize;
	let fileType = allCFValues[idx].filetype;
	if (downloadUrl !== 'None') {
	    if ($('#chk_' + fileType).is(':checked')) {
		total += filesize;
	    }
	}
    }
    $('#expectedDatasize').text(prettySize(total));
}

function clearUrlList() {
    // Remove previous list
    if ($('#urlListLabel').length !== 0){
	$('#urlListLabel').remove();
    }
    if ($('#urlList').length !== 0){
	$('#urlList').remove();
    }
}

function getUrlList() {
    clearUrlList();
    $('#downloadUrlList').append('<div class="row"><div><label id="urlListLabel">List of Downloadable Data URLs:</label></div></div>');
    $('#downloadUrlList').append('<div class="row"><div class="col-sm-12"><textarea style="overflow-y:scroll;min-width:100%;" rows="20" id="urlList" readonly></textarea></div></div>');
    let urlListText = "";
    let zenodoUrlPrefix = 'https://sandbox.zenodo.org/records';
    // Get grouping by Zenodo Id
    let allCFValues = globalCF.dimension(d => d.zenodo_id).top(Infinity);
    for (var idx=0; idx<allCFValues.length; idx++) {
	let downloadUrl = allCFValues[idx].url;
	let fileType = allCFValues[idx].filetype;
	if (downloadUrl != 'None') {
	    if ($('#chk_' + fileType).is(':checked')) {
		urlListText += downloadUrl + "\n";
	    }
	}
    }
    if (urlListText == "") {
	urlListText = "Download Warning: No records found!\n";
    }
    $('textarea#urlList').val(urlListText);
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
    loading(true, 'Loading Features Metadata. Please Wait.');
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

function clearCrossfilterPreview() {
    if ($('#xfilterPreviewPane').length !== 0) {
	$('#xfilterPreviewPane').remove();
    }
}

function genPreviewTable() {
    var crossfilterTable;
    // Reconstruct table's context
    clearCrossfilterPreview();
    $('#xfilterPreview').append('<div id="xfilterPreviewPane"></div>');

    // Create a table with one row for each record in the crossfilter construct
    $('#xfilterPreviewPane').append('<table class="display" id="xfilterPreviewTable" border=1></table>');
    $('#xfilterPreviewTable').append('<thead id="xfilterPreviewTableHeader"></thead>');
    $('#xfilterPreviewTable').append('<tbody id="xfilterPreviewTableBody"></tbody>');
    let headerText = '';
    let youtube
    for(let len = XFILTER_PARAMS.results_display.length, i=0; i<len; i++) {
        let cur_field = XFILTER_PARAMS.results_display[i];
        headerText += '<td>' + XFILTER_PARAMS.data_fields[cur_field].display_name + '</td>';
    }
    $('#xfilterPreviewTableHeader').append('<tr>' + headerText + '</tr>');

    // *CWL* - IMPORTANT! Create the DataTable FIRST before populating with data.
    //   If the table is populated before DataTable is allowed to kick in, it attempts to
    //   load and render ALL Youtube embeds - for 15000 of them, that takes forever.
    crossfilterTable = $('#xfilterPreviewTable').DataTable( {
	});

    let data = globalCF.dimension(d => d.strain).top(Infinity);
    let tableData = [];
    for (let rows = data.length, row=0; row<rows; row++) {
	let rowData = [];
	for(let len = XFILTER_PARAMS.results_display.length, i=0; i<len; i++) {
	    let cur_field = XFILTER_PARAMS.results_display[i];
	    // Special treatment for the youtube field to get the embed instead of the URL link
	    if (cur_field !== 'youtube') {
		rowData.push('<td>' + valueFormatted(data[row], cur_field) + '</td>');
	    } else {
		let youtubeId = data[row]['youtube_id'];
		rowData.push('<td>' + getYoutubeEmbed(youtubeId) + '</td>');
	    }
	}
	tableData.push(rowData);
    }
    crossfilterTable.rows.add(tableData).draw();
}
