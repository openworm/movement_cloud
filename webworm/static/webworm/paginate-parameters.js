var selectedParamIndices = {};
var hiddenParamIndex = 5;

$(document).ready(function() {
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

	paramTable.on( 'select', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var origData = paramTable.rows(indexes).data();
		    var selectLength = indexes.length;
		    for (var i=0; i<selectLength; i++) {
			if (!selectedParamIndices[indexes[i]]) {
			    selectedParamIndices[indexes[i]] = "true";
			    var data = [];
			    // *CWL* This is an annoying hardcode.
			    data.push(origData[i][0]); // name of parameter
			    data.push(origData[i][1]); // min value
			    data.push('<input type="number" name="' +
				      origData[i][0] + '_minParam" class="form-control" id="' +
				      origData[i][0] + '_minParam"></input>');
			    data.push(origData[i][2]); // max value
			    data.push('<input type="number" name="' +
				      origData[i][0] + '_maxParam" class="form-control" id="' +
				      origData[i][0] + '_maxParam"></input>');
			    data.push(indexes[i]);
			    confirmParamTable.row.add(data);
			}
		    }
		    confirmParamTable.draw();
		}
	    } );

	paramTable.on( 'deselect', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var selectLength = indexes.length;
		    for (var i=0; i<selectLength; i++) {
			if (selectedParamIndices[indexes[i]]) {
			    delete selectedParamIndices[indexes[i]];
			    confirmParamTable.row( function(idx, data, node){
				    return data[hiddenParamIndex] === indexes[i]?true:false;
				}).remove();
			}
		    }
		    confirmParamTable.draw();
		}
	    } );
    } );
