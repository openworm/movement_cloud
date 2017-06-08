# -*- coding: utf-8 -*-
"""
Handle WCON uploads from our site
"""

import sys
from http.server import HTTPServer # For the Server
from http.server import SimpleHTTPRequestHandler  # For the Handler

"""
HandlerClass = SimpleHTTPRequestHandler

# Specify the bind address and port
server_address = ("", 8000)

HandlerClass.protocol_version = "HTTP/1.0"
with HTTPServer(server_address, HandlerClass) as httpd:
    sa = httpd.socket.getsockname()
    serve_message = ("Now serving HTTP on {host} port {port} " +
                    "(http://{host}:{port}/) ...")
    print(serve_message.format(host=sa[0], port=sa[1]))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received, exiting.")
        sys.exit(0)
"""

SimpleHTTPRequestHandler.protocol_version = "HTTP/1.0"
httpd = HTTPServer(("", 8000), SimpleHTTPRequestHandler)

sa = httpd.socket.getsockname()
print("Serving HTTP on", sa[0], "port", sa[1], "...")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nKeyboard interrupt received, exiting.")
    httpd.server_close()
    sys.exit(0)