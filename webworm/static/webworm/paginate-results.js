$(document).ready(function() {
	$('#results').DataTable( {
		"pageLength": 10,
		dom: 'Blfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });
    } );
