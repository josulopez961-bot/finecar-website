"""Servidor local con URLs limpias (/contacto -> contacto.html), igual que Netlify.

Uso:  python serve.py        ->  http://127.0.0.1:4177/
"""
import http.server
import os
import socketserver

PORT = 4177
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        real = super().translate_path(path)
        if not os.path.exists(real) and not os.path.splitext(real)[1] and os.path.exists(real + ".html"):
            return real + ".html"
        return real

    def send_error(self, code, message=None, explain=None):
        if code == 404 and os.path.exists("404.html"):
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open("404.html", "rb") as f:
                self.wfile.write(f.read())
            return
        super().send_error(code, message, explain)


with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"FINECAR en http://127.0.0.1:{PORT}/")
    httpd.serve_forever()
