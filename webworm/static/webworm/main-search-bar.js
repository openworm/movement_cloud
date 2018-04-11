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
		"value" : discreteFieldMetadata[currIdx] + "= '" + 
		          discreteFieldData[currIdx][recordIdx][0] + "'",
		    });
    }
}

function split(val) {
    return val.split(/,\s*/);
}

function extractLast(term) {
    return split(term).pop();
}

$("#searchBar").bind('keypress', function(e){
	if ( e.keyCode == 13 ) {
	    submitSearchBar();
	}
    });

// don't navigate away from the field on tab when selecting an item
$("#searchBar").on( "keydown", function( event ) {
	if ( event.keyCode === $.ui.keyCode.TAB &&
	     $( this ).autocomplete( "instance" ).menu.active ) {
	    event.preventDefault();
	}
    });

$("#searchBar").catcomplete({
   delay: 0,
   minLength: 2,
   source: function(request, response) {
		// delegate back to autocomplete, but extract the last term
		response($.ui.autocomplete.filter(databaseFieldData, 
						  extractLast(request.term)));
	    },
   focus: function() {
		// prevent value inserted on focus
		return false;
	    },
   select: function(event, ui) {
		var terms = split( this.value );
		// remove the current input
		terms.pop();
		// add the selected item
		terms.push(ui.item.value);
		// add placeholder to get the comma-and-space at the end
		terms.push("");
		this.value = terms.join(", ");
		return false;
	    },
   });

$("#searchBar").change(function() {
	scrollToBottom();
    });

function scrollToBottom() {
    $('#searchBar').scrollTop($('#searchBar')[0].scrollHeight);
}

function parseAndUpdateSearch() {
    var termDict = {};
    text = $('#searchBar').val();
    //    terms = text.split(",");
    var terms = text.match(/(\s*[^,'=]*=\s*'[^']*')|(\s*[^,'=]*=\s*[^,]*)/g);
    // console.log(terms);
    for (var termIdx in terms) {
	var term = terms[termIdx];
	// ignore completely empty terms (contains only whitespaces)
	if (term.replace(/\s/g, '').length > 0) {
	    components = term.split("=");
	    if (components.length != 2) {
		alert("Invalid term: " + term);
		return false;
	    } else {
		// Remove white spaces.
		components[0] = components[0].trim();
		catIdx = discreteFieldMetadata.indexOf(components[0]);
		if (catIdx == -1) {
		    alert("No such category (" + components[0] + ") in term: " + term);
		    return false;
		}
		if (!(components[0] in termDict)) {
		    termDict[components[0]] = "";
		}
		var value = encodeURIComponent(components[1].trim().replace(/[\']+/g,'')); 
		// console.log('Value of ' + components[0] + ': ' + value);
		// Use commas only if tacking on additional terms.
		if (termDict[components[0]] != "") {
		    termDict[components[0]] += "," + value;
		} else {
		    termDict[components[0]] = value;
		}
	    }
	}
    }
    for (var term in termDict) {
	$("#hiddenDiscreteInput").append('<input type="hidden" id="' + 
					 term + 'InputList" name="' +
					 term + '" value=""/>');
	// console.log(termDict[term]);
	$('#' + term + 'InputList').val(termDict[term]);
    }
    return true;
}

// Search Bar will have special behavior where the existing Advanced Search configurations
//   are ignored.
var submitSearchBar = function() {
    if (parseAndUpdateSearch()) {
	createCrossfilterFeatureInput();
	loading(true, 'Loading Crossfilter Data. Please Wait.');
	$('#searchForm').submit();
    }
}

