import http from "http";
import path from "path";
import fs from "fs";

// Optional: helpful type for responses
type Json = Record<string, unknown>;

// Simple helper to send JSON responses
function sendJson(res: http.ServerResponse, status: number, data: Json) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// Simple helper to send text responses
function sendText(res: http.ServerResponse, status: number, text: string) {
  res.writeHead(status, { "Content-Type": "text/plain" });
  res.end(text);
}

// Create the server
const server = http.createServer((req, res) => {
  if (!req.url) {
    sendText(res, 400, "Bad Request");
    return;
  }

  console.log(`Incoming request: ${req.method} ${req.url}`);

  // Example API route
  if (req.url === "/api/status") {
    sendJson(res, 200, {
      ok: true,
      message: "TrackerKeeper server is running",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Example: serve a static file (optional)
  if (req.url === "/") {
    const filePath = path.join(process.cwd(), "index.html");

    if (fs.existsSync(filePath)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      fs.createReadStream(filePath).pipe(res);
    } else {
      sendText(res, 404, "index.html not found");
    }
    return;
  }

  // Fallback for unknown routes
  sendText(res, 404, "Not Found");
});

// Start the server
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});