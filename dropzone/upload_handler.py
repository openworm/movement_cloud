# -*- coding: utf-8 -*-
"""
Handle WCON uploads from our site
"""
import re
import sys
import os
import urllib
from six import StringIO  # StringIO.StringIO in 2.x, io.StringIO in 3.x
from http.server import SimpleHTTPRequestHandler, HTTPServer


class MichaelHTTPRequestHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.0"

    def do_POST(self):
        """Serve a POST request."""
        r, info = self.deal_post_data()
        print(r, info, "by: ", self.client_address)
        f = StringIO()
        f.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">')
        f.write("<html>\n<title>Upload Result Page</title>\n")
        f.write("<body>\n<h2>Upload Result Page</h2>\n")
        f.write("<hr>\n")
        if r:
            f.write("<strong>Success:</strong>")
        else:
            f.write("<strong>Failed:</strong>")
        f.write(info)
        f.write("<br><a href=\"%s\">back</a>" % self.headers['referer'])
        f.write("<hr><small>Powerd By: bones7456, check new version at ")
        f.write("<a href=\"http://li2z.cn/?s=SimpleHTTPServerWithUpload\">")
        f.write("here</a>.</small></body>\n</html>\n")
        length = f.tell()
        f.seek(0)
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Content-Length", str(length))
        self.end_headers()
        if f:
            self.wfile.write(f.read().encode('utf-8'))
            f.close()
        
    def deal_post_data(self):
        # Put the header values into a familiar dict object
        #headers = dict(zip(self.headers.keys(), self.headers.values()))

        remainbytes = int(self.headers['content-length'])
        # Find the boundary from content-type, which might look like:
        # 'multipart/form-data; boundary=----WebKitFormBoundaryUI1LY7c2BiEKGfFk'
        boundary = self.headers['content-type'].split("=")[1]

        self.log_message("HEADERS: '" + str(self.headers.items()) + ", " +
                         str(type(self.headers)) + "'HEADERS DONE.")
        
        line_str = self.rfile.readline().decode('utf-8')
        remainbytes -= len(line_str)
        if not boundary in line_str:
            return (False, "Content NOT begin with boundary")
        
        # Content-Disposition: form-data; name="file[]"; filename="README.md"
        line_str = self.rfile.readline().decode('utf-8')
        remainbytes -= len(line_str)
        fn = re.findall('Content-Disposition.*name="file"; filename="(.*)"', line_str)
        if not fn:
            return (False, "Can't find out file name...")
        path = self.translate_path(self.path)
        # Strip this script's name from the path so it's just a folder
        path = os.path.dirname(path)
        fn = os.path.join(path, fn[0])

        # Content-Type: application/octet-stream
        line_str = self.rfile.readline().decode('utf-8')
        remainbytes -= len(line_str)

        # Blank line
        line_str = self.rfile.readline().decode('utf-8')
        remainbytes -= len(line_str)
        try:
            out = open(fn, 'wb')
        except IOError:
            return (False, "Can't create file to write, " + 
                    "do you have permission to write?")
                
        # First real line of code
        preline = self.rfile.readline().decode('utf-8')
        remainbytes -= len(preline)
        while remainbytes > 0:
            line_str = self.rfile.readline().decode('utf-8')
            remainbytes -= len(line_str)
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
        return (False, "Unexpect Ends of data.")
    
    
    def do_POST2(self):
        self.log_message("RECEIVED A POST request")
        #self.log_message("headers: " + str(self.headers))

        length_bytes = self.headers['content-length']
        data = self.rfile.read(int(length_bytes)).decode('utf-8')
        print("Headers:")
        print(self.headers)
        print(urllib.parse.parse_qs(data))
        
        self.log_message(str(type(data)))
        self.log_message(str(data))
        
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        response_string = ("<html><body><h1>" + data + "</h1></body></html>")
        self.wfile.write(response_string.encode('utf-8'))

        with open('aa.dat', 'w') as fh:
            fh.write(data)
        
            # 200 OK
        self.send_response(200)

    def do_GET(self):
        self.log_message("Received a GET request")
        
        super(MichaelHTTPRequestHandler, self).do_GET()

        
httpd = HTTPServer(("", 8000), MichaelHTTPRequestHandler)
sa = httpd.socket.getsockname()
print("Serving HTTP on", sa[0], "port", sa[1], "...")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nKeyboard interrupt received, exiting.")
    httpd.server_close()
    sys.exit(0)