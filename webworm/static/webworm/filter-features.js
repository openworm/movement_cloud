var selectedParamIndices = {};
var paramTable;

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

	paramTable = $('#parameters').DataTable( {
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
			var paramName = origData[i][0];

			// This particular check is extremely important now
			//   that we have 2 bound tables.
			if ((!selectedParamIndices[paramName]) || 
			    (selectedParamIndices[paramName] === "core")) {
			    // Insert entries only from the full table, and not core.
			    var data = [];
			    data.push('<p>' + paramName + '</p>' + 
				      '<input type="hidden" readonly' +
				      ' name="' + paramName + '_isFeature" />');
			    confirmParamTable.row.add(data);
			    selectedParamIndices[paramName] = "full";

			    // Update the sister table if necessary
			    coreParamTable.row( function(idx,data, node) {
				    return data[0] === paramName?true:false;
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
			    // The jquery gymnastics is required to deal with
			    //   the extra <input> tag inserted into the final
			    //   table.
			    confirmParamTable.row( function(idx, data, node) {
				    return $('p','<div>' + data[0] + '</div>').text() === 
					origData[i][0]?true:false;
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

	var selectCoreFeaturesFromState = function() {
	    let filteredFeatureState = prevAdvancedFilterState['filteredFeatures'];
	    if (Object.keys(filteredFeatureState).length != 0) {
		coreParamTable.rows().every( function(rowIdx,tableLoop,rowLoop) {
			// if found, select.
			if (filteredFeatureState[this.data()[0]]) {
			    // alert('found' + this.data()[0]);
			    this.select();
			}
		    });
	    }
	    // piggyback the dates along with this function
	    if ('start_date' in prevAdvancedFilterState) {
		$('#start_date').val(prevAdvancedFilterState['start_date']);
	    }
	    if ('end_date' in prevAdvancedFilterState) {
		$('#end_date').val(prevAdvancedFilterState['end_date']);
	    }
	}
	selectCoreFeaturesFromState();
	
    } );
