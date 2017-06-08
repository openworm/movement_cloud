"use strict";

if(document.readyState === "complete") {
    createDropzoneMethods();
} else {
    document.addEventListener("DOMContentLoaded", createDropzoneMethods);
}

function upload(files) {
    let upload_results = document.getElementById("upload_results_element");
    let formData = new FormData(),
        xhr = new XMLHttpRequest();
    
    console.log("Dropped " + String(files.length) + " files.");
    for(let i=0; i<files.length; i++) {
        formData.append("file", files[i]);
    }
    
    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            alert(xhr.responseText);
        }

        //console.log(xhr.response);
        upload_results.innerHTML = this.response;
    }

    console.log("Let's upload files: ", formData);
    xhr.open('POST', 'upload_handler.py', true); // async = true
    xhr.send(formData); //'{"Michael": 13, "Carolyn": 5}'
    

}


function createDropzoneMethods() {
    let dropzone = document.getElementById("dropzone_element");

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

        upload(e.dataTransfer.files)
    }    
}
