/**
 * JobFinder – Local development server
 * Pure Node.js (no npm dependencies required to run)
 *
 * Usage:
 *   node server.js
 *   → http://localhost:5000
 *
 * For Vercel deployment the /api/* routes are handled by serverless functions.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { db, saveData, hashPassword, checkPassword, publicUser } = require("./lib/store");

const PORT = process.env.PORT || 5000;
const ROOT = __dirname;

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

async function handleApi(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  let body = {};
  if (req.method === "POST" || req.method === "PUT") {
    try {
      body = await readBody(req);
    } catch {
      sendJson(res, 400, { message: "Invalid JSON body" });
      return;
    }
  }

  // ---------- POST /api/register ----------
  if (url.pathname === "/api/register" && req.method === "POST") {
    const { name, email, password, phone } = body;
    if (!name || !email || !password) {
      sendJson(res, 400, { message: "Please fill all required fields" });
      return;
    }
    if (db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
      sendJson(res, 400, { message: "This email is already registered. Please login." });
      return;
    }
    const { salt, hash } = hashPassword(password);
    const user = {
      id: Date.now().toString(),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : "",
      salt,
      hash,
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
    saveData(db);
    sendJson(res, 201, {
      message: "Registration successful!",
      user: publicUser(user),
    });
    return;
  }

  // ---------- POST /api/login ----------
  if (url.pathname === "/api/login" && req.method === "POST") {
    const { email, password } = body;
    if (!email || !password) {
      sendJson(res, 400, { message: "Please enter email and password" });
      return;
    }
    const user = db.users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
    if (!user || !checkPassword(password, user)) {
      sendJson(res, 401, { message: "Invalid email or password" });
      return;
    }
    sendJson(res, 200, {
      message: "Login successful!",
      user: publicUser(user),
    });
    return;
  }

  // ---------- POST /api/apply ----------
  if (url.pathname === "/api/apply" && req.method === "POST") {
    const { user_id, job_id } = body;
    if (!user_id || !job_id) {
      sendJson(res, 400, { message: "user_id and job_id are required" });
      return;
    }
    if (
      db.applications.some(
        (a) => a.user_id === String(user_id) && a.job_id === String(job_id)
      )
    ) {
      sendJson(res, 400, { message: "You have already applied for this job." });
      return;
    }
    db.applications.push({
      user_id: String(user_id),
      job_id: String(job_id),
      applied_at: new Date().toISOString(),
    });
    saveData(db);
    sendJson(res, 201, { message: "Job application submitted successfully!" });
    return;
  }

  // ---------- POST /api/profile ----------
  if (url.pathname === "/api/profile" && req.method === "POST") {
    if (!body.email) {
      sendJson(res, 400, { message: "Email is required to save a profile." });
      return;
    }
    const i = db.profiles.findIndex(
      (p) => p.email.toLowerCase() === String(body.email).toLowerCase()
    );
    const profile = {
      ...body,
      email: String(body.email).toLowerCase(),
      updated_at: new Date().toISOString(),
    };
    if (i >= 0) db.profiles[i] = profile;
    else db.profiles.push(profile);
    saveData(db);
    sendJson(res, 200, { message: "Profile saved successfully!" });
    return;
  }

  // ---------- GET /api/jobs (bonus) ----------
  if (url.pathname === "/api/jobs" && req.method === "GET") {
    sendJson(res, 200, { jobs: db.jobs || [] });
    return;
  }

  sendJson(res, 404, { message: "Unknown API endpoint: " + url.pathname });
}

// ---------- Static file server ----------
const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function serveStatic(req, res) {
  let pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found: " + pathname);
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  console.log(new Date().toLocaleTimeString(), req.method, req.url);
  if (req.url.startsWith("/api/")) {
    handleApi(req, res).catch((e) => {
      console.error(e);
      sendJson(res, 500, { message: "Server error" });
    });
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 JobFinder running at http://localhost:${PORT}`);
  console.log(`   Users: ${db.users.length} | Applications: ${db.applications.length}`);
  console.log(`   Press Ctrl+C to stop\n`);
});
