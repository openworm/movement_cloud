$(document).ready(function() {
	$('#parameters').DataTable( {
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
