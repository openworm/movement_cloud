# -*- coding: utf-8 -*-
"""
Handle WCON uploads from our site
"""

from http.server import SimpleHTTPRequestHandler, CGIHTTPRequestHandler, test
import argparse

class MichaelHTTPRequestHandler(SimpleHTTPRequestHandler):
    pass

parser = argparse.ArgumentParser()
parser.add_argument('--cgi', action='store_true',
                   help='Run as CGI Server')
parser.add_argument('--bind', '-b', default='', metavar='ADDRESS',
                    help='Specify alternate bind address '
                         '[default: all interfaces]')
parser.add_argument('port', action='store',
                    default=8000, type=int,
                    nargs='?',
                    help='Specify alternate port [default: 8000]')
args = parser.parse_args()
if args.cgi:
    handler_class = CGIHTTPRequestHandler
else:
    handler_class = SimpleHTTPRequestHandler
test(HandlerClass=handler_class, port=args.port, bind=args.bind)
