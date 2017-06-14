# -*- coding: utf-8 -*-
import re
import sys
import os
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer


class FileUploadHTTPRequestHandler(SimpleHTTPRequestHandler):
    """An HTTP Server that accepts POST requests and saves them as
    files in the same folder as this script.

    """
    protocol_version = "HTTP/1.1"

    def do_POST(self):
        """Handle a POST request."""
        #self.log_message(str(self.headers))
        # Save files received in the POST
        wasSuccess, files_uploaded = self.handle_file_uploads()

        # Compose a response to the client
        response_obj = {
            "wasSuccess": wasSuccess,
            "files_uploaded": files_uploaded,
            "client_address": self.client_address
        }

        response_str = json.dumps(response_obj)

        self.log_message(response_str)

        # Send our response code, header, and data
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.send_header("Content-Length", len(response_str))
        self.end_headers()
        self.wfile.write(response_str.encode('utf-8'))

    def read_line(self):
        line_str = self.rfile.readline().decode('utf-8')
        self.char_remaining -= len(line_str)
        return line_str

    def handle_file_uploads(self):
        """
        Take the post request and save any files received to the same folder
        as this script.

        Returns
            wasSuccess: bool: whether the process was a success
            files_uploaded: list of string: files that were created
        """
        self.char_remaining = int(self.headers['content-length'])
        # Find the boundary from content-type, which might look like:
        # 'multipart/form-data; boundary=----WebKitFormBoundaryUI1LY7c2BiEKGfFk'
        boundary = self.headers['content-type'].split("=")[1]

        basepath = self.translate_path(self.path)
        # Strip this script's name from the path so it's just a folder
        basepath = os.path.dirname(basepath)

        # ----WebKitFormBoundaryUI1LY7c2BiEKGfFk
        line_str = self.read_line()
        if not boundary in line_str:
            self.log_message("Content did NOT begin with boundary as " +
                             "it should")
            return False, []

        files_uploaded = []
        while self.char_remaining > 0:
            # Breaking out of this loop on anything except a boundary
            # an end-of-file will be a failure, so let's assume that
            wasSuccess = False

            # Content-Disposition: form-data; name="file"; filename="README.md"
            line_str = self.read_line()
            filename = re.findall('Content-Disposition.*name="file"; ' +
                                  'filename="(.*)"', line_str)
            if not filename:
                self.log_message("Can't find filename " + filename)
                break
            else:
                filename = filename[0]
            filepath = os.path.join(basepath, filename)
            try:
                outfile = open(filepath, 'wb')
            except IOError:
                self.log_message("Can't create file " + str(filepath) +
                                 " to write; do you have permission to write?")
                break

            # Content-Type: application/octet-stream
            line_str = self.read_line()

            # Blank line
            line_str = self.read_line()

            # First real line of code
            preline = self.read_line()
            # Loop through the POST until we find another boundary line,
            # signifying the end of this file and the possible start of another
            while self.char_remaining > 0:
                line_str = self.read_line()

                # ----WebKitFormBoundaryUI1LY7c2BiEKGfFk
                if boundary in line_str:
                    preline = preline[0:-1]
                    if preline.endswith('\r'):
                        preline = preline[0:-1]
                    outfile.write(preline.encode('utf-8'))
                    outfile.close()
                    self.log_message("File '%s' upload success!" % filename)
                    files_uploaded.append(filename)
                    # If this was the last file, the session was a success!
                    wasSuccess = True
                    break
                else:
                    outfile.write(preline.encode('utf-8'))
                    preline = line_str

        return wasSuccess, files_uploaded

        
if __name__ == "__main__":
    httpd = HTTPServer(("", 8000), FileUploadHTTPRequestHandler)
    sa = httpd.socket.getsockname()
    print("Serving HTTP on", sa[0], "port", sa[1], "...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received, exiting.")
        httpd.server_close()
        sys.exit(0)
