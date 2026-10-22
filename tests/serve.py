"""Local test server that disables caching, so the tests always run the code on disk.

Usage (from the project folder):  python3 tests/serve.py   then open http://localhost:8765/tests/
"""
import http.server
import functools
import os


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    handler = functools.partial(NoCacheHandler, directory=root)
    http.server.ThreadingHTTPServer(('127.0.0.1', 8765), handler).serve_forever()
