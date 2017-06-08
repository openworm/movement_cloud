# -*- coding: utf-8 -*-
"""
Handle WCON uploads from our site
"""

#import json
#import os
#import sys

#os.getenv("QUERY_STRING")

#raw_post_data = sys.stdin.read()

#print(raw_post_data)

#!/usr/bin/env python
 
from http.server import BaseHTTPRequestHandler, HTTPServer
 
# HTTPRequestHandler class
class testHTTPServer_RequestHandler(BaseHTTPRequestHandler):
    pass
    # GET
    """
    def do_GET(self):
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
        
def run():
    print('starting server...')
 
    # Server settings
    # Choose port 8080, for port 80, which is normally used for a http server, you need root access
    server_address = ('127.0.0.1', 8000)
    httpd = HTTPServer(server_address, testHTTPServer_RequestHandler)
    print('running server...')
    httpd.serve_forever()
 
 
run()