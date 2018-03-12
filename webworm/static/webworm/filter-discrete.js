// Discrete information
var discreteElementsPerRow = 2;
var discreteConfirmElementsPerRow = 4;
var hiddenDiscreteIndex = 1;

$.widget( "custom.catcomplete", $.ui.autocomplete, {
	_create: function() {
	    this._super();
	    this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
	},
	_renderMenu: function( ul, items ) {
	    var that = this,
		currentCategory = "";
	    $.each( items, function( index, item ) {
		    var li;
		    if ( item.category != currentCategory ) {
			ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
			currentCategory = item.category;
		    }
		    li = that._renderItemData( ul, item );
		    if ( item.category ) {
			li.attr( "aria-label", item.category + " : " + item.label );
		    }
		});
	},
    });

// Format - { label: "annhhx10", category: "Products" },
var databaseFieldData = [];

// Construct database field information for autocomplete search bar
for (var currIdx=0; currIdx<discreteFieldData.length; currIdx++) {
    for (var recordIdx=0; recordIdx<discreteFieldData[currIdx].length; recordIdx++) {
	databaseFieldData.push({ 
		"category" : discreteFieldNames[currIdx],
         	"label" : discreteFieldData[currIdx][recordIdx][0],
		"value" : discreteFieldMetadata[currIdx] + "=" + 
		          discreteFieldData[currIdx][recordIdx][0],
		    });
    }
}

$("#searchBar").bind('keypress', function(e){
	if ( e.keyCode == 13 ) {
	    submitSearchBar();
	}
    });

$("#searchBar").catcomplete({
   delay: 0,
   source: databaseFieldData,
   select: function(event, ui) {
	    var data = ui.item.value.split("=");
	    console.log(data);
	    $('#hiddenDiscreteInput').append('<input type="hidden" id="' + data[0] +
					     'InputList" name="' + data[0] +
					     '" value="' + data[1] + '"/>');
   },
});

function createDiscreteHiddenInput(domTag) {
    for (var disIdx=0; disIdx<discreteFieldMetadata.length; disIdx++) {
	var fieldString = '';
	var discreteFieldName = discreteFieldMetadata[disIdx];
	discreteTables[disIdx].rows({ selected: true }).every( function(index) {
	//	confirmTables[disIdx].rows().every( function(index) {
		var data = this.data();
		fieldString += data[0] + ',';
	    });
	// remove last excess comma
        fieldString = fieldString.substring(0, fieldString.length - 1);
	//	alert(fieldString);
	// Insert hidden input HTML elements
	$(domTag).append('<input type="hidden" id="' + 
			 discreteFieldName + 'InputList" name="' +
			 discreteFieldName + '" value=""/>');
	$('#' + discreteFieldName + 'InputList').val(fieldString);
    }
}

// On Form Submission, populate the discrete search parameters
var submitAdvancedFilter = function() {
    createDiscreteHiddenInput('#hiddenDiscreteInput');
    createCrossfilterFeatureInput();
    loading(true, 'Loading Crossfilter Data. Please Wait.');
    $('#searchForm').submit();
}

// Search Bar will have special behavior where the existing Advanced Search configurations
//   are ignored.
var submitSearchBar = function() {
    createCrossfilterFeatureInput();
    loading(true, 'Loading Crossfilter Data. Please Wait.');
    $('#searchForm').submit();
}

var populateDiscreteTables = function() {
    for (var currIdx=0; currIdx < discreteFieldMetadata.length; currIdx++) {
	let rowIdx = Math.floor(currIdx/discreteElementsPerRow);
	let confirmRowIdx = Math.floor(currIdx/discreteConfirmElementsPerRow);
	if (currIdx%discreteElementsPerRow == 0) {
	    // create a new row
	    $('#discreteFieldsContentPane').append('<hr><div class="row" id="dRow' +
						   rowIdx + '"></div>');
	}
	if (currIdx%discreteConfirmElementsPerRow == 0) {
	    // create a new row of confirmation tables
	    $('#confirm_fields_panel').append('<dir class="row" id="dConfirmRow' +
					      confirmRowIdx + '"></div>');
	}
	// Insert and populate record tables
	$('#dRow' + rowIdx).append('<div class="col-sm-6">' +
				   '<h4>' + discreteFieldNames[currIdx] + ' Records</h4>' +
				   '<a href="#sum_' + discreteFieldMetadata[currIdx] + '_panel"' +
				   'class="btn btn-info" data-toggle="collapse">' +
				   'Toggle ' + discreteFieldNames[currIdx] + '</a>' +
				   '<div id="sum_' + discreteFieldMetadata[currIdx] + '_panel"' +
				   'class="collapse">' +
				   '<table id="sum_' + discreteFieldMetadata[currIdx] + '"' +
				   'class="table table-striped table-bordered table-responsive">' +
				   '<thead>' +
				   '<tr>' +
				   '<th>Name</th>' +
				   '<th>Num Experiments</th>' +
				   '</tr>' +
				   '</thead>' +
				   '<tbody id="dBody' + currIdx + '">' +
				   '</tbody>' +
				   '</table>' +
				   '</div>');
	for (var recordIdx=0; recordIdx<discreteFieldData[currIdx].length; recordIdx++) {
	    $('#dBody' + currIdx).append('<tr>' +
					 '<td>' + discreteFieldData[currIdx][recordIdx][0] + '</td>' +
					 '<td>' + discreteFieldData[currIdx][recordIdx][1] + '</td>' +
					 '</tr>');
	}
	// Insert empty confirmation tables
	$('#dConfirmRow' + confirmRowIdx).append('<div class="col-sm-3">' +
						 '<p><b>' + discreteFieldNames[currIdx] + 
						 '</b></p>' +
						 '<table id="' + discreteFieldMetadata[currIdx] +
						 'Confirm" class="table table-striped ' +
						 'table-bordered table-responsive">' +
						 '<thead>' +
						 '<tr><th>Name</th></tr>' +
						 '</thead>' +
						 '<tbody>' +
						 '</tbody>' +
						 '</table>' +
						 '</div>');
    }
    // Insert line breaks for main tables
    $('#discreteFieldsContentPane').append('<hr>');
}

var selectEventFactory = function(discreteTable, confirmTable, discreteIndex) {
    var returnFunction = function(e, dt, type, indexes) {
	var localDiscreteTable = discreteTable;
	var localConfirmTable = confirmTable;
	var localDiscreteIndex = discreteIndex;
	if ( type === 'row' ) {
	    var origData = localDiscreteTable.rows(indexes).data();
	    var selectLength = indexes.length;
	    for (var sIdx=0; sIdx<selectLength; sIdx++) {
		if (!localDiscreteIndex[indexes[sIdx]]) {
		    localDiscreteIndex[indexes[sIdx]] = "true";
		    var data = [];
		    // *CWL* This is an annoying hardcode.
		    data.push(origData[sIdx][0]); // name of parameter
		    data.push(indexes[sIdx]);
		    localConfirmTable.row.add(data);
		}
	    }
	    localConfirmTable.draw();
	}
    }
    return returnFunction;
}
	
var deselectEventFactory = function(discreteTable, confirmTable, discreteIndex) {
    var returnFunction = function(e, dt, type, indexes) {
	var localDiscreteTable = discreteTable;
	var localConfirmTable = confirmTable;
	var localDiscreteIndex = discreteIndex;
	if ( type === 'row' ) {
	    var selectLength = indexes.length;
	    for (var sIdx=0; sIdx<selectLength; sIdx++) {
		if (localDiscreteIndex[indexes[sIdx]]) {
		    delete localDiscreteIndex[indexes[sIdx]];
		    localConfirmTable.row( function(idx, data, node){
			    return data[hiddenDiscreteIndex] === 
				indexes[sIdx]?true:false;
			}).remove();
		}
	    }
	    localConfirmTable.draw();
	}
    }
    return returnFunction;
}
    
populateDiscreteTables();
var discreteIndices = new Array(discreteFieldMetadata.length);
var discreteTables = new Array(discreteFieldMetadata.length);
var confirmTables = new Array(discreteFieldMetadata.length);
for (var disIdx=0; disIdx<discreteFieldMetadata.length; disIdx++) {
    discreteIndices[disIdx] = {};
    discreteTables[disIdx] = $('#sum_'+ discreteFieldMetadata[disIdx]).DataTable( {
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
	    }
	});
    confirmTables[disIdx] = $('#'+discreteFieldMetadata[disIdx]+'Confirm').DataTable( {
	    "columnDefs": [ {
		    "targets":[hiddenDiscreteIndex],
		    "visible": false,
		    "searchable": false
		},],
	    "bFilter": false,
	    deferRender:    true,
	    scrollY:        200,
	    scrollCollapse: true,
	    scroller:       true,
	});
    var discreteTable = discreteTables[disIdx];
    var discreteIndex = discreteIndices[disIdx];
    var confirmTable = confirmTables[disIdx];
    discreteTable.on('select', 
		     selectEventFactory(discreteTable, confirmTable, discreteIndex));
    discreteTable.on('deselect', 
		     deselectEventFactory(discreteTable, confirmTable, discreteIndex));
}

var selectDiscreteTableRowsFromState = function() {
    for (var disIdx=0; disIdx<discreteTables.length; disIdx++) {
	let filterState = prevAdvancedFilterState[discreteFieldMetadata[disIdx]];
	if (filterState) {
	    discreteTables[disIdx].rows().every( function(rowIdx,tableLoop,rowLoop) {
		    // if found, select.
		    if (filterState[this.data()[0]]) {
			// alert('found' + this.data()[0]);
			this.select();
		    }
		});
	}
    }
}
selectDiscreteTableRowsFromState();