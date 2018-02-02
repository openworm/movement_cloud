// Handle drag and drop into a dropzone_element div:
// send the files as a POST request to the server
"use strict";

// Only start once the DOM tree is ready
if(document.readyState === "complete") {
    createDropzoneMethods();
} else {
    document.addEventListener("DOMContentLoaded", createDropzoneMethods);
}

function createDropzoneMethods() {
    // When we start, the initial worm visualization should be running
    document.getElementById("upload_file_button").style.display = 'block';
    document.getElementById("upload_area").style.display = 'none';
    document.getElementById("WCON_display").style.display = 'block';

    let dropzone = document.getElementById("dropzone");

    dropzone.ondragover = function() {
        this.className = "dropzone dragover";
        return false;
    }
    
    dropzone.ondragleave = function() {
        this.className = "dropzone";
        return false;
    }

    dropzone.ondrop = function(e) {
        // Stop browser from simply opening that was just dropped
        e.preventDefault();  
        // Restore original dropzone appearance
        this.className = "dropzone";

        upload_files(e.dataTransfer.files)
    }    

    d3.select("#upload_file_button").on("click", function() {
        document.getElementById("upload_file_button").style.display = 'none';
        document.getElementById("upload_area").style.display = 'block';
        document.getElementById("WCON_display").style.display = 'block';
    });
    
}

function upload_files(files) {
    if (files.length == 1) {
	var reader = new FileReader();
	reader.onload = function(event) {
	    var contents = event.target.result;
	    let responseJSON = JSON.parse(contents);

            document.getElementById("upload_file_button").style.display = 'block';
            document.getElementById("upload_area").style.display = 'none';
            document.getElementById("WCON_display").style.display = 'block';

	    view_WCON_json(files[0].name, responseJSON); 
	};

	reader.onerror = function(event) {
	    console.error("File could not be read! Code " + event.target.error.code);
	};

	reader.readAsText(files[0]);
    } else {
	alert('This tool will only handle a single file at a time. Please try again.');
    }
}