// *CWL* - A lot of hardcodes to get an early prototype working. 
//        Can be refactored to be better parameterized. Please fix.
var selectedStrainsIndices = {};
var selectedTrackersIndices = {};
var selectedSexIndices = {};
var selectedDevIndices = {};
var selectedVentralIndices = {};
var selectedFoodIndices = {};
var selectedArenaIndices = {};
var selectedHabituationIndices = {};
var selectedExperimentersIndices = {};
var hiddenDiscreteIndex = 1;

$(document).ready(function() {

	var strainsTable = $('#sum_strains').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });

	var trackersTable = $('#sum_trackers').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });

	var sexTable = $('#sum_sex').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });

	var devTable = $('#sum_dev').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });

	var ventralTable = $('#sum_ventral').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });

	var foodTable = $('#sum_food').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });

	var arenaTable = $('#sum_arena').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });

	var habitTable = $('#sum_habit').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });
	var exprTable = $('#sum_experimenter').DataTable( {
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });

	var confirmStrainsTable = $('#confirmStrains').DataTable( {
		"columnDefs": [
	{
	    "targets":[hiddenDiscreteIndex],
	    "visible": false,
	    "searchable": false
	},
			       ],
	});

	strainsTable.on( 'select', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var origData = strainsTable.rows(indexes).data();
		    var selectLength = indexes.length;
		    for (var i=0; i<selectLength; i++) {
			if (!selectedStrainsIndices[indexes[i]]) {
			    selectedStrainsIndices[indexes[i]] = "true";
			    var data = [];
			    // *CWL* This is an annoying hardcode.
			    data.push(origData[i][0]); // name of parameter
			    data.push(indexes[i]);
			    confirmStrainsTable.row.add(data);
			}
		    }
		    confirmStrainsTable.draw();
		}
	    } );

	strainsTable.on( 'deselect', function ( e, dt, type, indexes ) {
		if ( type === 'row' ) {
		    var selectLength = indexes.length;
		    for (var i=0; i<selectLength; i++) {
			if (selectedStrainsIndices[indexes[i]]) {
			    delete selectedStrainsIndices[indexes[i]];
			    confirmStrainsTable.row( function(idx, data, node){
				    return data[hiddenDiscreteIndex] === indexes[i]?true:false;
				}).remove();
			}
		    }
		    confirmStrainsTable.draw();
		}
	    } );


    } );
