/* Minimal realtime presence server for the static Spidey Tracker app.
 * Uses only Node.js built-ins; presence is intentionally in-memory for MVP.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.SPIDEY_PORT || 4173);
const HEARTBEAT_TIMEOUT_MS = 65000;
const presence = new Map();
const streams = new Set();

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function json(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  response.end(JSON.stringify(payload));
}

function sendEvent(client, event) {
  try {
    client.response.write("data: " + JSON.stringify(event) + "\n\n");
  } catch (_) {
    streams.delete(client);
  }
}

function broadcast(event, excludedSessionId) {
  streams.forEach((client) => {
    if (client.sessionId !== excludedSessionId) sendEvent(client, event);
  });
}

function listPresence() {
  return [...presence.values()].map((user) => ({ ...user }));
}

function cleanUsername(value) {
  const username = String(value || "").trim();
  return /^[A-Za-z0-9_ -]{3,24}$/.test(username) ? username : null;
}

function parsePresence(body) {
  const username = cleanUsername(body.username);
  const sessionId = String(body.sessionId || "").trim();
  if (!username || !sessionId || sessionId.length > 120) return null;
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  return {
    sessionId,
    username,
    latitude: Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 ? latitude : null,
    longitude: Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 ? longitude : null,
    lastSeen: Date.now()
  };
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10000) request.destroy();
    });
    request.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); }
    });
    request.on("error", reject);
  });
}

async function handlePresenceApi(request, response, requestUrl) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
    response.end();
    return;
  }

  if (requestUrl.pathname === "/api/presence/stream" && request.method === "GET") {
    const sessionId = requestUrl.searchParams.get("sessionId") || "";
    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
    response.write(": spidey presence stream connected\n\n");
    const client = { response, sessionId };
    streams.add(client);
    request.on("close", () => streams.delete(client));
    return;
  }

  if (requestUrl.pathname === "/api/presence" && request.method === "GET") {
    json(response, 200, { users: listPresence() });
    return;
  }

  const routes = ["/api/presence/join", "/api/presence/heartbeat", "/api/presence/leave"];
  if (!routes.includes(requestUrl.pathname) || request.method !== "POST") {
    json(response, 404, { error: "Presence route not found" });
    return;
  }

  let body;
  try { body = await readBody(request); } catch (_) {
    json(response, 400, { error: "Invalid JSON payload" });
    return;
  }

  if (requestUrl.pathname === "/api/presence/leave") {
    const sessionId = String(body.sessionId || "");
    if (presence.delete(sessionId)) broadcast({ type: "left", sessionId });
    json(response, 200, { users: listPresence() });
    return;
  }

  const user = parsePresence(body);
  if (!user) {
    json(response, 400, { error: "Valid username and sessionId are required" });
    return;
  }

  if (requestUrl.pathname === "/api/presence/join") {
    const duplicate = [...presence.values()].some((entry) => entry.sessionId !== user.sessionId && entry.username.toLowerCase() === user.username.toLowerCase());
    if (duplicate) {
      json(response, 409, { error: "Username is already active" });
      return;
    }
  }

  const existed = presence.has(user.sessionId);
  presence.set(user.sessionId, user);
  if (requestUrl.pathname === "/api/presence/join" && !existed) {
    broadcast({ type: "joined", user }, user.sessionId);
  } else if (requestUrl.pathname === "/api/presence/heartbeat") {
    broadcast({ type: "heartbeat", user }, user.sessionId);
  }
  json(response, 200, { users: listPresence(), user });
}

function serveStatic(request, response, requestUrl) {
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.resolve(ROOT, "." + pathname);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-cache"
  });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, "http://" + (request.headers.host || "localhost"));
  if (requestUrl.pathname.startsWith("/api/presence")) {
    await handlePresenceApi(request, response, requestUrl);
    return;
  }
  serveStatic(request, response, requestUrl);
});

setInterval(() => {
  const cutoff = Date.now() - HEARTBEAT_TIMEOUT_MS;
  presence.forEach((user, sessionId) => {
    if (user.lastSeen < cutoff) {
      presence.delete(sessionId);
      broadcast({ type: "left", sessionId });
    }
  });
}, 15000).unref();

setInterval(() => {
  streams.forEach((client) => {
    try { client.response.write(": keep-alive\n\n"); } catch (_) { streams.delete(client); }
  });
}, 20000).unref();

server.listen(PORT, () => {
  console.log("Spidey Tracker running at http://localhost:" + PORT + "/");
  console.log("Presence API ready at http://localhost:" + PORT + "/api/presence");
});
