"""Minimal realtime presence server for Spidey Tracker.

Uses only Python's standard library. Presence is stored in memory for the MVP.
"""
import json
import os
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get("SPIDEY_PORT", "4173"))
HEARTBEAT_TIMEOUT_SECONDS = 65
presence = {}
streams = []
state_lock = threading.Lock()


def clean_username(value):
    username = str(value or "").strip()
    if len(username) < 3 or len(username) > 24:
        return None
    allowed = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_ -")
    return username if all(char in allowed for char in username) else None


def parse_presence(payload):
    username = clean_username(payload.get("username"))
    session_id = str(payload.get("sessionId") or "").strip()
    if not username or not session_id or len(session_id) > 120:
        return None
    try:
        latitude = float(payload.get("latitude"))
        if not -90 <= latitude <= 90:
            latitude = None
    except (TypeError, ValueError):
        latitude = None
    try:
        longitude = float(payload.get("longitude"))
        if not -180 <= longitude <= 180:
            longitude = None
    except (TypeError, ValueError):
        longitude = None
    return {
        "sessionId": session_id,
        "username": username,
        "latitude": latitude,
        "longitude": longitude,
        "lastSeen": int(time.time() * 1000),
    }


def current_users():
    with state_lock:
        return [dict(user) for user in presence.values()]


def send_event(stream, event):
    stream.wfile.write(("data: " + json.dumps(event) + "\n\n").encode("utf-8"))
    stream.wfile.flush()


def broadcast(event, excluded_session_id=None):
    dead = []
    with state_lock:
        clients = list(streams)
    for stream in clients:
        if stream.session_id == excluded_session_id:
            continue
        try:
            send_event(stream, event)
        except (BrokenPipeError, ConnectionResetError, OSError):
            dead.append(stream)
    if dead:
        with state_lock:
            for stream in dead:
                if stream in streams:
                    streams.remove(stream)


class SpideyHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/presence"):
            if parsed.path == "/":
                self.path = "/index.html"
            super().do_GET()
            return

        if parsed.path == "/api/presence":
            self.end_json(200, {"users": current_users()})
            return

        if parsed.path == "/api/presence/stream":
            query = parse_qs(parsed.query)
            self.session_id = query.get("sessionId", [""])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-transform")
            self.send_header("Connection", "keep-alive")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            with state_lock:
                streams.append(self)
            try:
                self.wfile.write(b": spidey presence stream connected\n\n")
                self.wfile.flush()
                while True:
                    time.sleep(20)
                    self.wfile.write(b": keep-alive\n\n")
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, OSError):
                pass
            finally:
                with state_lock:
                    if self in streams:
                        streams.remove(self)
            return

        self.end_json(404, {"error": "Presence route not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/presence"):
            self.end_json(404, {"error": "Presence route not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length) or b"{}")
        except (ValueError, json.JSONDecodeError):
            self.end_json(400, {"error": "Invalid JSON payload"})
            return

        if parsed.path == "/api/presence/leave":
            session_id = str(payload.get("sessionId") or "")
            with state_lock:
                removed = presence.pop(session_id, None)
            if removed:
                broadcast({"type": "left", "sessionId": session_id})
            self.end_json(200, {"users": current_users()})
            return

        if parsed.path not in ("/api/presence/join", "/api/presence/heartbeat"):
            self.end_json(404, {"error": "Presence route not found"})
            return

        user = parse_presence(payload)
        if not user:
            self.end_json(400, {"error": "Valid username and sessionId are required"})
            return

        with state_lock:
            if parsed.path == "/api/presence/join":
                duplicate = any(
                    entry["sessionId"] != user["sessionId"]
                    and entry["username"].lower() == user["username"].lower()
                    for entry in presence.values()
                )
                if duplicate:
                    self.end_json(409, {"error": "Username is already active"})
                    return
            existed = user["sessionId"] in presence
            presence[user["sessionId"]] = user

        if parsed.path == "/api/presence/join" and not existed:
            broadcast({"type": "joined", "user": user}, user["sessionId"])
        elif parsed.path == "/api/presence/heartbeat":
            broadcast({"type": "heartbeat", "user": user}, user["sessionId"])
        self.end_json(200, {"users": current_users(), "user": user})

    def log_message(self, format_string, *args):
        if not self.path.startswith("/api/presence/stream"):
            super().log_message(format_string, *args)


def cleanup_presence():
    while True:
        time.sleep(15)
        cutoff = int(time.time() * 1000) - HEARTBEAT_TIMEOUT_SECONDS * 1000
        expired = []
        with state_lock:
            for session_id, user in list(presence.items()):
                if user["lastSeen"] < cutoff:
                    expired.append(session_id)
                    del presence[session_id]
        for session_id in expired:
            broadcast({"type": "left", "sessionId": session_id})


if __name__ == "__main__":
    cleanup_thread = threading.Thread(target=cleanup_presence, daemon=True)
    cleanup_thread.start()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), SpideyHandler)
    print("Spidey Tracker running at http://localhost:" + str(PORT) + "/")
    print("Presence API ready at http://localhost:" + str(PORT) + "/api/presence")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nSpidey Tracker stopped.")
    finally:
        server.server_close()
