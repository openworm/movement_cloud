# -*- coding: utf-8 -*-
"""
Handle WCON uploads from our site
"""

import sys
from http.server import SimpleHTTPRequestHandler, HTTPServer
 
# HTTPRequestHandler class
class MichaelHTTPRequestHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.0"

    def do_POST(self):
        self.log_message("RECEIVED A POST request")
        #self.log_message("headers: " + str(self.headers))

        length_bytes = self.headers['content-length']
        data = self.rfile.read(int(length_bytes)).decode('utf-8')
        self.log_message(str(type(data)))
        self.log_message(str(data))
        
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        response_string = ("<html><body><h1>" + data + "</h1></body></html>")
        self.wfile.write(response_string.encode('utf-8'))
        
        with open('welifjwelf.dat', 'w') as fh:
            fh.write(data)
        
            # 200 OK
        self.send_response(200)

    def do_GET(self):
        self.log_message("Received a GET request")
        
        super(MichaelHTTPRequestHandler, self).do_GET()
        """
        # Send response status code
        self.send_response(200)
         
        # Send headers
        self.send_header('Content-type','text/html')
        self.end_headers()
         
        # Send message back to client
        message = "Hello world!"
        # Write content as utf-8 data
        self.wfile.write(bytes(message, "utf8"))
        return
        """
        
httpd = HTTPServer(("", 8000), MichaelHTTPRequestHandler)
sa = httpd.socket.getsockname()
print("Serving HTTP on", sa[0], "port", sa[1], "...")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nKeyboard interrupt received, exiting.")
    httpd.server_close()
    sys.exit(0)