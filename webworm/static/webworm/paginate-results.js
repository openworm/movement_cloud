$(document).ready(function() {
	$('#results').DataTable( {
		dom: 'Bfrtip',
		buttons: [
			  'selectAll',
			  'selectNone',
			  ],
		select: {
		    style: 'multi'
		}
	    });
    } );
