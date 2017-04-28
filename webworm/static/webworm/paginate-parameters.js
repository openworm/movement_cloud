var selectedParamIndices = {};
var hiddenParamIndex = 5;

$(document).ready(function() {

	var coreParamTable = $('#coreFeaturesTable').DataTable( {
		dom: 'Brtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		},
	    });

	var paramTable = $('#parameters').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		},
	    });

	var confirmParamTable = $('#confirmParameters').DataTable( {
		"columnDefs": [
	           {
		       "targets":[hiddenParamIndex],
		       "visible": false,
		       "searchable": false
		   },
		],
	    });

	// *CWL* In the case of features, the name of the feature makes for a
	//   perfectly stable key. This is really the only way to bind the 
	//   3 tables together since the selection can happen from either
	//   the core or full table, and must update each other.

	coreParamTable.on( 'select', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var origData = coreParamTable.rows(indexes).data();
		    var selectLength = indexes.length;
		    for (var i=0; i<selectLength; i++) {
			// This particular check is extremely important now
			//   that we have 2 bound tables.
			if (!selectedParamIndices[origData[i][0]]) {
			    selectedParamIndices[origData[i][0]] = "core";
			    // The core table currently contains insufficient
			    //   information to insert new entries into the
			    //   confirmed table. This has to be done by
			    //   the full list.
			    // Update the sister table if necessary
			    paramTable.row( function(idx, data, node) {
				    return data[0] === origData[i][0]?true:false;
				}).select();
			}
		    }
		}
		// Draw the other two tables
		paramTable.draw();
		confirmParamTable.draw();
	    } );

	paramTable.on( 'select', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var origData = paramTable.rows(indexes).data();
		    var selectLength = indexes.length;
		    for (var i=0; i<selectLength; i++) {
			// This particular check is extremely important now
			//   that we have 2 bound tables.
			if ((!selectedParamIndices[origData[i][0]]) || 
			    (selectedParamIndices[origData[i][0]] === "core")) {
			    // Insert entries only from the full table, and not core.
			    var data = [];
			    // *CWL* This is an annoying hardcode.
			    data.push(origData[i][0]); // name of parameter
			    data.push(origData[i][1]); // min value
			    data.push('<input type="text" name="' +
				      origData[i][0] + '_minParam" class="form-control" id="' +
				      origData[i][0] + '_minParam"></input>');
			    data.push(origData[i][2]); // max value
			    data.push('<input type="text" name="' +
				      origData[i][0] + '_maxParam" class="form-control" id="' +
				      origData[i][0] + '_maxParam"></input>');
			    data.push(indexes[i]);
			    confirmParamTable.row.add(data);
			    selectedParamIndices[origData[i][0]] = "full";

			    // Update the sister table if necessary
			    coreParamTable.row( function(idx,data, node) {
				    return data[0] === origData[i][0]?true:false;
				}).select();
			}
		    }
		    // Draw the other two tables
		    coreParamTable.draw();
		    confirmParamTable.draw();
		}
	    } );


	// *CWL* In the case of deselection, the operations are symmetric
	coreParamTable.on('deselect', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var origData = coreParamTable.rows(indexes).data();
		    var selectLength = indexes.length;
		    for (var i=0; i<selectLength; i++) {
			if (selectedParamIndices[origData[i][0]]) {
			    delete selectedParamIndices[origData[i][0]];
			    confirmParamTable.row( function(idx, data, node){
				    return data[0] === origData[i][0]?true:false;
				}).remove();
			    // Tell sister table to deselect too
			    paramTable.row( function(idx,data, node) {
				    return data[0] === origData[i][0]?true:false;
				}).deselect();
			}
		    }
		    coreParamTable.draw();
		    confirmParamTable.draw();
		}
	    } );
	
	paramTable.on( 'deselect', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var origData = paramTable.rows(indexes).data();
		    var selectLength = indexes.length;
		    for (var i=0; i<selectLength; i++) {
			if (selectedParamIndices[origData[i][0]]) {
			    delete selectedParamIndices[origData[i][0]];
			    confirmParamTable.row( function(idx, data, node){
				    return data[0] === origData[i][0]?true:false;
				}).remove();
			    // Tell sister table to deselect too
			    coreParamTable.row( function(idx,data, node) {
				    return data[0] === origData[i][0]?true:false;
				}).deselect();

			}
		    }
		    coreParamTable.draw();
		    confirmParamTable.draw();
		}
	    } );
    } );
