var selectedResultsIndices = {};
var hiddenResultsIndex = 12;
var zenodoLinkIndex = 10;

var confirmResultsTable;

// *CWL* This is the old function for faking a list of data URLs to download.
//   Retaining only for reference.
function processResults() {
    var returnText = "";
    var data = confirmResultsTable.rows().data();
    for (var i=0; i<data.length; i++) {
	var linkText = data[i][zenodoLinkIndex];
	var urlText = $(linkText).attr('href');
	returnText = returnText + urlText + "\n";
    }
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(returnText));
    element.setAttribute('download', 'zenodo_urls.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

$(document).ready(function() {
	var resultsTable = $('#results').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		},
	    });

	confirmResultsTable = $('#confirmResults').DataTable( {
		"columnDefs": [
	           {
		       "targets":[hiddenResultsIndex],
		       "visible": false,
		       "searchable": false
		   },
		],
	    });

	// *CWL* - The association of the key between the two tables relies heavily
	//     on the indices ("indexes" in code) for resultsTable staying static.
	//     If for any reason, this is not true for DataTables (i.e. some event
	//     changes the order for indexes in relation to rows in the table) this
	//     whole scheme falls apart, and another way to establish key-to-row
	//     associations between the two tables is required. 
	resultsTable.on( 'select', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var data = resultsTable.rows(indexes).data();
		    var selectLength = indexes.length;
		    for (var i=0; i<selectLength; i++) {
			if (!selectedResultsIndices[indexes[i]]) {
			    selectedResultsIndices[indexes[i]] = "true";
			    // *CWL* - TODO: check to see if the original data gets 
			    //         changed here
			    data[i].push(indexes[i]);
			    confirmResultsTable.row.add(data[i]);
			}
		    }
		    confirmResultsTable.draw();
		}
	    } );

	resultsTable.on( 'deselect', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var selectLength = indexes.length;
		    for (var i=0; i<selectLength; i++) {
			if (selectedResultsIndices[indexes[i]]) {
			    delete selectedResultsIndices[indexes[i]];
			    confirmResultsTable.row( function(idx, data, node){
				    return data[hiddenResultsIndex] === indexes[i]?true:false;
				}).remove();
			}
		    }
		    confirmResultsTable.draw();
		}
	    } );


    } );
