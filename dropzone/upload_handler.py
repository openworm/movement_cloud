# -*- coding: utf-8 -*-
"""
Handle WCON uploads from our site
"""
import re
import sys
import os
from six import StringIO  # StringIO.StringIO in 2.x, io.StringIO in 3.x
from http.server import SimpleHTTPRequestHandler, HTTPServer


class FileUploadHTTPRequestHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.0"

    def do_POST(self):
        """Serve a POST request."""
        wasSuccess, info = self.handle_file_uploads()
        print(wasSuccess, info, "by: ", )
        f = StringIO()
        f.write("<h2>Upload Result Page</h2>\n<hr>\n")
        if wasSuccess:
            f.write("<strong>Success:</strong>")
        else:
            f.write("<strong>Failed:</strong>")
        f.write(info)
        f.write("<p>handled by script: " + str(self.client_address) + ".")
        f.write("<br><a href=\"%s\">back</a>" % self.headers['referer'])
        f.seek(0)
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Content-Length", str(f.tell()))
        self.end_headers()
        if f:
            self.wfile.write(f.read().encode('utf-8'))
            f.close()
        
    def handle_file_uploads(self):
        """
        Take the post request and save any files received to the same folder
        as this script.
        
        Returns (bool, string)
            bool: whether the process was a success
            string: error or result message
        """
        char_remaining = int(self.headers['content-length'])
        # Find the boundary from content-type, which might look like:
        # 'multipart/form-data; boundary=----WebKitFormBoundaryUI1LY7c2BiEKGfFk'
        boundary = self.headers['content-type'].split("=")[1]

        self.log_message("HEADERS: '" + str(self.headers.items()) + ", " +
                         str(type(self.headers)) + "'HEADERS DONE.")
        
        line_str = self.rfile.readline().decode('utf-8')
        char_remaining -= len(line_str)
        if not boundary in line_str:
            return (False, "Content did NOT begin with boundary as it should")
        
        # Content-Disposition: form-data; name="file[]"; filename="README.md"
        line_str = self.rfile.readline().decode('utf-8')
        char_remaining -= len(line_str)
        fn = re.findall('Content-Disposition.*name="file"; filename="(.*)"',
                        line_str)
        if not fn:
            return (False, "Can't find out file name.")
        path = self.translate_path(self.path)
        # Strip this script's name from the path so it's just a folder
        path = os.path.dirname(path)
        fn = os.path.join(path, fn[0])

        # Content-Type: application/octet-stream
        line_str = self.rfile.readline().decode('utf-8')
        char_remaining -= len(line_str)

        # Blank line
        line_str = self.rfile.readline().decode('utf-8')
        char_remaining -= len(line_str)
        try:
            out = open(fn, 'wb')
        except IOError:
            return (False, "Can't create file " + str(fn) + " to write; " + 
                           "do you have permission to write?")
                
        # First real line of code
        preline = self.rfile.readline().decode('utf-8')
        char_remaining -= len(preline)
        while char_remaining > 0:
            line_str = self.rfile.readline().decode('utf-8')
            char_remaining -= len(line_str)
            if boundary in line_str:
                preline = preline[0:-1]
                if preline.endswith('\r'):
                    preline = preline[0:-1]
                out.write(preline.encode('utf-8'))
                out.close()
                return (True, "File '%s' upload success!" % fn)
            else:
                out.write(preline.encode('utf-8'))
                preline = line_str
        return (False, "Unexpected end of data.")

        
httpd = HTTPServer(("", 8000), FileUploadHTTPRequestHandler)
sa = httpd.socket.getsockname()
print("Serving HTTP on", sa[0], "port", sa[1], "...")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nKeyboard interrupt received, exiting.")
    httpd.server_close()
    sys.exit(0)