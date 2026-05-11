import { createServer } from "node:http";
import { Readable } from "node:stream";
import handler from "./server/server.js";

const port = Number(process.env.PORT) || 3000;

function nodeRequestToFetch(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = new URL(req.url || "/", `${proto}://${host}`);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else if (v != null) headers.set(k, String(v));
  }

  const init = { method: req.method, headers };
  if (req.method && !["GET", "HEAD"].includes(req.method.toUpperCase())) {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }
  return new Request(url.toString(), init);
}

async function writeFetchResponse(response, res) {
  res.statusCode = response.status;
  response.headers.forEach((v, k) => {
    if (k.toLowerCase() === "content-encoding") return;
    res.setHeader(k, v);
  });
  if (!response.body) return res.end();
  const reader = response.body.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}

const server = createServer(async (req, res) => {
  try {
    const request = nodeRequestToFetch(req);
    const response = await handler.fetch(request, process.env, {});
    await writeFetchResponse(response, res);
  } catch (err) {
    console.error("[ssr] handler error", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain");
    }
    res.end("Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`[ssr] listening on ${port}`);
});
