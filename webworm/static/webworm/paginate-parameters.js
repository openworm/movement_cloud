var selectedParamIndices = {};

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
		"pageLength": 5,
		// *CWL* Forced to turn pagination off for this table for now.
		// Paging redraw mechanics for DataTables work poorly with
		//   jQuery sliders. Perhaps we can find a work-around.
		"bPaginate": false,
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
			var minValue = Number(origData[i][1]);
			var maxValue = Number(origData[i][2]);

			var labelMinElement = "labelMin_" + indexes[i];
			var labelMaxElement = "labelMax_" + indexes[i];
			var sliderElement = "slider_" + indexes[i];

			// This particular check is extremely important now
			//   that we have 2 bound tables.
			if ((!selectedParamIndices[paramName]) || 
			    (selectedParamIndices[paramName] === "core")) {
			    // Insert entries only from the full table, and not core.
			    var data = [];
			    data.push(paramName);
			    data.push(minValue);
			    data.push(maxValue);
			    data.push('<p><label for="' + labelMinElement + '">From:</label>' +
				      '<input type="text" id="' + labelMinElement + '" readonly' + 
				      ' name="' + paramName + '_minInput" value=""' +
				      ' style="border:0; color:#f6931f; font-weight:bold;">' +
				      '</p>' +
				      '<p><label for="' + labelMaxElement + '">To:</label>' +
				      '<input type="text" id="' + labelMaxElement + '" readonly' + 
				      ' name="' + paramName + '_maxInput" value=""' +
				      ' style="border:0; color:#f6931f; font-weight:bold;">' +
				      '</p>' +
				      '<div id="' + sliderElement + '"></div>');
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

		    // This second loop is to allow an optimization where each row
		    //   does not have to be drawn immediately. Sliders are implemented
		    //   in a way that requires the slider elements to be drawn before
		    //   they can be manipulated.
		    for (var i=0; i<selectLength; i++) {
			var minValue = Number(origData[i][1]);
			var maxValue = Number(origData[i][2]);
			var rangeStep = (maxValue - minValue)/100.0;

			// Dealing with the quirks of rounding where sliders are concerned
			var searchMin = minValue - rangeStep;
			var searchMax = maxValue + rangeStep;
			
			var labelMinElement = "labelMin_" + indexes[i];
			var labelMaxElement = "labelMax_" + indexes[i];
			var sliderElement = "slider_" + indexes[i];
			$("#" + sliderElement).slider({
				range: true,
				    min: searchMin,
				    max: searchMax,
				    values: [searchMin, searchMax],
				    step: rangeStep,
				    slide: function(event, ui) {
				    $("#" + labelMinElement).val(ui.values[0]);
				    $("#" + labelMaxElement).val(ui.values[1]);
				}
			    });
			$("#"+labelMinElement).val($("#"+sliderElement).slider("values", 0));
			$("#"+labelMaxElement).val($("#"+sliderElement).slider("values", 1));
		    }
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
