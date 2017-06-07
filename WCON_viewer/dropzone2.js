"use strict";

if(document.readyState === "complete") {
    createDropzoneMethods();
} else {
    document.addEventListener("DOMContentLoaded", createDropzoneMethods);
}

function upload(files) {
    let formData = new FormData(),
        xhr = new XMLHttpRequest();
        
    for(let x=0; x<files.length; x++) {
        formData.append("file[]", files[x]);
    }
    
    xhr.onload = function() {
        let upload_results = document.getElementById("upload_results_element");

        upload_results.innerHTML = "YES IT IS DONE!";
    }

    console.log("Let's upload files: ", formData);
    xhr.open('post', 'upload_handler2.py');
    xhr.send(formData);


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
