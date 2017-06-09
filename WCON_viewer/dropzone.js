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

    let upload_button = document.getElementById("upload_file_button");

    upload_button.onclick = function() {
        document.getElementById("upload_file_button").style.display = 'none';
        document.getElementById("upload_area").style.display = 'block';
        document.getElementById("WCON_display").style.display = 'block';
    }
    
}

function upload_files(files) {
    let upload_results = document.getElementById("upload_results_element");
    let formData = new FormData(),
        xhr = new XMLHttpRequest();

    console.log("Dropped " + String(files.length) + " files.");
    for(let i=0; i<files.length; i++) {
        formData.append("file", files[i]);
    }

    xhr.onreadystatechange = function() {
        // Handle the times this function was invoked with blank response text
        let responseText = xhr.responseText === '' ? '{}' : xhr.responseText;
        let responseJSON = JSON.parse(responseText);
        if(xhr.readyState === XMLHttpRequest.DONE) {
            alert("The files " + responseJSON.files_uploaded +
                  " have been uploaded.");

            // Now that the WCON file has been loaded, hide the upload field
            document.getElementById("upload_file_button").style.display = 'block';
            document.getElementById("upload_area").style.display = 'none';
            document.getElementById("WCON_display").style.display = 'block';

            view_WCON_data_file(responseJSON.files_uploaded)
        }
        console.log(responseJSON);
    }

    console.log("Let's upload files: ", formData);
    xhr.open('POST', 'upload_handler.py', true); // async = true
    xhr.send(formData); 
}