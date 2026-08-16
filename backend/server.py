"""Spidey Tracker realtime server backed by MySQL.

The browser talks to this server over HTTP/SSE. MySQL stores active sessions
and appearance history; SSE only keeps the live connections in memory.
"""
import json
import os
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

try:
    import mysql.connector
    from mysql.connector import Error as MySQLError
    from mysql.connector import IntegrityError
    from mysql.connector import pooling
except ModuleNotFoundError:
    mysql = None
    MySQLError = Exception
    IntegrityError = Exception
    pooling = None


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get("SPIDEY_PORT", "4173"))
HEARTBEAT_TIMEOUT_SECONDS = 90
DB_HOST = os.environ.get("DB_HOST", "127.0.0.1")
DB_PORT = int(os.environ.get("DB_PORT", "3306"))
DB_NAME = os.environ.get("DB_NAME", "spidey_tracker")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_POOL_SIZE = int(os.environ.get("DB_POOL_SIZE", "5"))
streams = []
stream_lock = threading.Lock()


class DuplicateUsername(Exception):
    """Raised when an active session already owns the username."""


def clean_username(value):
    username = str(value or "").strip()
    if len(username) < 3 or len(username) > 24:
        return None
    allowed = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_ -")
    return username if all(char in allowed for char in username) else None


def parse_presence(payload):
    username = clean_username(payload.get("username"))
    session_id = str(payload.get("sessionId") or "").strip()
    if not username or not session_id or len(session_id) > 36:
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
        "usernameNormalized": username.lower().strip(),
        "latitude": latitude,
        "longitude": longitude,
        "locationShared": latitude is not None and longitude is not None,
    }


class PresenceDatabase:
    def __init__(self):
        if pooling is None:
            raise RuntimeError(
                "mysql-connector-python belum terpasang. Jalankan: "
                "pip install -r backend/requirements.txt"
            )
        self.pool = pooling.MySQLConnectionPool(
            pool_name="spidey_presence_pool",
            pool_size=max(1, min(DB_POOL_SIZE, 32)),
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            autocommit=False,
        )

    def connection(self):
        return self.pool.get_connection()

    @staticmethod
    def user_from_row(row):
        if not row:
            return None
        last_seen = row[6]
        if last_seen.tzinfo is None:
            last_seen_ms = int(last_seen.timestamp() * 1000)
        else:
            last_seen_ms = int(last_seen.timestamp() * 1000)
        return {
            "sessionId": row[0],
            "username": row[1],
            "latitude": float(row[2]) if row[2] is not None else None,
            "longitude": float(row[3]) if row[3] is not None else None,
            "lastSeen": last_seen_ms,
            "isSelf": False,
        }

    def fetch_users(self):
        connection = self.connection()
        cursor = connection.cursor()
        try:
            cursor.execute(
                """
                SELECT session_id, username, latitude, longitude,
                       location_shared, status, last_seen
                FROM presence_sessions
                WHERE status = 'online'
                  AND last_seen >= UTC_TIMESTAMP(6) - INTERVAL 90 SECOND
                ORDER BY last_seen DESC
                """
            )
            return [self.user_from_row(row) for row in cursor.fetchall()]
        finally:
            cursor.close()
            connection.close()

    def upsert(self, user, is_join):
        connection = self.connection()
        cursor = connection.cursor()
        try:
            connection.start_transaction()
            cursor.execute(
                """
                SELECT session_id
                FROM presence_sessions
                WHERE username_normalized = %s
                  AND status = 'online'
                  AND session_id <> %s
                FOR UPDATE
                """,
                (user["usernameNormalized"], user["sessionId"]),
            )
            if cursor.fetchone():
                connection.rollback()
                raise DuplicateUsername()

            cursor.execute(
                """
                SELECT status, latitude, longitude
                FROM presence_sessions
                WHERE session_id = %s
                FOR UPDATE
                """,
                (user["sessionId"],),
            )
            previous = cursor.fetchone()
            cursor.execute(
                """
                INSERT INTO presence_sessions (
                  session_id, username, username_normalized,
                  latitude, longitude, location_shared, status, last_seen
                ) VALUES (%s, %s, %s, %s, %s, %s, 'online', UTC_TIMESTAMP(6))
                ON DUPLICATE KEY UPDATE
                  username = VALUES(username),
                  username_normalized = VALUES(username_normalized),
                  latitude = VALUES(latitude),
                  longitude = VALUES(longitude),
                  location_shared = VALUES(location_shared),
                  status = 'online',
                  last_seen = UTC_TIMESTAMP(6)
                """,
                (
                    user["sessionId"],
                    user["username"],
                    user["usernameNormalized"],
                    user["latitude"],
                    user["longitude"],
                    user["locationShared"],
                ),
            )

            event_type = None
            if previous is None or previous[0] == "offline":
                event_type = "joined"
            elif (
                not is_join
                and (previous[1], previous[2])
                != (user["latitude"], user["longitude"])
            ):
                event_type = "location_updated"

            if event_type:
                cursor.execute(
                    """
                    INSERT INTO appearance_events (
                      session_id, username_snapshot, event_type,
                      latitude, longitude
                    ) VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        user["sessionId"],
                        user["username"],
                        event_type,
                        user["latitude"],
                        user["longitude"],
                    ),
                )
            connection.commit()
            return event_type
        except IntegrityError as error:
            connection.rollback()
            if "uq_presence_username_status" in str(error):
                raise DuplicateUsername() from error
            raise
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()
            connection.close()

    def leave(self, session_id):
        connection = self.connection()
        cursor = connection.cursor()
        try:
            connection.start_transaction()
            cursor.execute(
                """
                SELECT username, latitude, longitude
                FROM presence_sessions
                WHERE session_id = %s AND status = 'online'
                FOR UPDATE
                """,
                (session_id,),
            )
            previous = cursor.fetchone()
            if not previous:
                connection.rollback()
                return False
            cursor.execute(
                """
                UPDATE presence_sessions
                SET status = 'offline', last_seen = UTC_TIMESTAMP(6)
                WHERE session_id = %s
                """,
                (session_id,),
            )
            cursor.execute(
                """
                INSERT INTO appearance_events (
                  session_id, username_snapshot, event_type,
                  latitude, longitude
                ) VALUES (%s, %s, 'went_offline', %s, %s)
                """,
                (session_id, previous[0], previous[1], previous[2]),
            )
            connection.commit()
            return True
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()
            connection.close()

    def expire_stale(self):
        connection = self.connection()
        cursor = connection.cursor()
        expired = []
        try:
            connection.start_transaction()
            cursor.execute(
                """
                SELECT session_id, username, latitude, longitude
                FROM presence_sessions
                WHERE status = 'online'
                  AND last_seen < UTC_TIMESTAMP(6) - INTERVAL 90 SECOND
                FOR UPDATE
                """,
            )
            expired = cursor.fetchall()
            for session_id, username, latitude, longitude in expired:
                cursor.execute(
                    """
                    UPDATE presence_sessions
                    SET status = 'offline', last_seen = UTC_TIMESTAMP(6)
                    WHERE session_id = %s
                    """,
                    (session_id,),
                )
                cursor.execute(
                    """
                    INSERT INTO appearance_events (
                      session_id, username_snapshot, event_type,
                      latitude, longitude
                    ) VALUES (%s, %s, 'went_offline', %s, %s)
                    """,
                    (session_id, username, latitude, longitude),
                )
            connection.commit()
            return [row[0] for row in expired]
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()
            connection.close()


def send_event(stream, event):
    stream.wfile.write(("data: " + json.dumps(event) + "\n\n").encode("utf-8"))
    stream.wfile.flush()


def broadcast(event, excluded_session_id=None):
    dead = []
    with stream_lock:
        clients = list(streams)
    for stream in clients:
        if stream.session_id == excluded_session_id:
            continue
        try:
            send_event(stream, event)
        except (BrokenPipeError, ConnectionResetError, OSError):
            dead.append(stream)
    if dead:
        with stream_lock:
            for stream in dead:
                if stream in streams:
                    streams.remove(stream)


class SpideyHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    database = None

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

        try:
            if parsed.path == "/api/presence":
                self.end_json(200, {"users": self.database.fetch_users()})
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
                with stream_lock:
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
                    with stream_lock:
                        if self in streams:
                            streams.remove(self)
                return

            self.end_json(404, {"error": "Presence route not found"})
        except MySQLError:
            self.end_json(503, {"error": "Database unavailable"})

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

        try:
            if parsed.path == "/api/presence/leave":
                session_id = str(payload.get("sessionId") or "")
                if self.database.leave(session_id):
                    broadcast({"type": "left", "sessionId": session_id})
                self.end_json(200, {"users": self.database.fetch_users()})
                return

            if parsed.path not in ("/api/presence/join", "/api/presence/heartbeat"):
                self.end_json(404, {"error": "Presence route not found"})
                return

            user = parse_presence(payload)
            if not user:
                self.end_json(400, {"error": "Valid username and sessionId are required"})
                return

            is_join = parsed.path == "/api/presence/join"
            event_type = self.database.upsert(user, is_join)
            if is_join and event_type == "joined":
                broadcast(
                    {
                        "type": "joined",
                        "user": {key: value for key, value in user.items() if key != "usernameNormalized"},
                    },
                    user["sessionId"],
                )
            elif not is_join:
                broadcast(
                    {
                        "type": "heartbeat",
                        "user": {key: value for key, value in user.items() if key != "usernameNormalized"},
                    },
                    user["sessionId"],
                )
            self.end_json(
                200,
                {
                    "users": self.database.fetch_users(),
                    "user": {key: value for key, value in user.items() if key != "usernameNormalized"},
                },
            )
        except DuplicateUsername:
            self.end_json(409, {"error": "Username is already active"})
        except MySQLError:
            self.end_json(503, {"error": "Database unavailable"})

    def log_message(self, format_string, *args):
        if not self.path.startswith("/api/presence/stream"):
            super().log_message(format_string, *args)


def cleanup_presence(database):
    while True:
        time.sleep(15)
        try:
            expired = database.expire_stale()
            for session_id in expired:
                broadcast({"type": "left", "sessionId": session_id})
        except MySQLError as error:
            print("Presence cleanup gagal:", error)


if __name__ == "__main__":
    try:
        database = PresenceDatabase()
    except (RuntimeError, MySQLError) as error:
        raise SystemExit(
            "Database MySQL belum siap: "
            + str(error)
            + "\nPastikan database sudah dimigrate dan environment DB_* sudah benar."
        )

    SpideyHandler.database = database
    cleanup_thread = threading.Thread(target=cleanup_presence, args=(database,), daemon=True)
    cleanup_thread.start()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), SpideyHandler)
    print("Spidey Tracker + MySQL running at http://localhost:" + str(PORT) + "/")
    print("Presence API ready at http://localhost:" + str(PORT) + "/api/presence")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nSpidey Tracker stopped.")
    finally:
        server.server_close()
