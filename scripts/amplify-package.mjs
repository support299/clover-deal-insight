#!/usr/bin/env node
// Packages the TanStack Start build for AWS Amplify Hosting (Web Compute / SSR).
//
// After `vite build` produces:
//   dist/client/   -> static assets
//   dist/server/   -> SSR handler (fetch API, ESM)
//
// This script assembles:
//   .amplify-hosting/
//     deploy-manifest.json
//     static/                  (served as static)
//     compute/default/
//       index.mjs              (Node http server wrapping the fetch handler)
//       package.json           ({ "type": "module" })
//       server/                (copy of dist/server)
//       node_modules/          (production deps required by server.js)

import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const out = join(root, ".amplify-hosting");

if (!existsSync(join(dist, "client")) || !existsSync(join(dist, "server"))) {
  console.error("[amplify-package] dist/client or dist/server missing. Run vite build first.");
  process.exit(1);
}

console.log("[amplify-package] cleaning .amplify-hosting");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// 1. static
console.log("[amplify-package] copying static assets");
cpSync(join(dist, "client"), join(out, "static"), { recursive: true });

// 2. compute/default
const compute = join(out, "compute", "default");
mkdirSync(compute, { recursive: true });

console.log("[amplify-package] copying server bundle");
cpSync(join(dist, "server"), join(compute, "server"), { recursive: true });

console.log("[amplify-package] copying node_modules (production deps)");
// Server bundle has external imports (h3-v2, @tanstack/*, react, react-dom, etc).
// Copy the full node_modules — Amplify upload size limit is generous and this
// is the safest way to ensure every transitive dep resolves at runtime.
cpSync(join(root, "node_modules"), join(compute, "node_modules"), {
  recursive: true,
  dereference: false,
});

// 3. compute package.json
writeFileSync(
  join(compute, "package.json"),
  JSON.stringify({ type: "module" }, null, 2),
);

// 4. compute entrypoint — Node http server bridging req/res <-> fetch
writeFileSync(
  join(compute, "index.mjs"),
  `import { createServer } from "node:http";
import { Readable } from "node:stream";
import handler from "./server/server.js";

const port = Number(process.env.PORT) || 3000;

function nodeRequestToFetch(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = new URL(req.url || "/", \`\${proto}://\${host}\`);

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
  console.log(\`[ssr] listening on \${port}\`);
});
`,
);

// 5. deploy-manifest.json (Amplify Hosting compute spec)
writeFileSync(
  join(out, "deploy-manifest.json"),
  JSON.stringify(
    {
      version: 1,
      framework: { name: "tanstack-start", version: "1" },
      routes: [
        { path: "/assets/*", target: { kind: "Static", cacheControl: "public, max-age=31536000, immutable" } },
        { path: "/favicon.ico", target: { kind: "Static" } },
        { path: "/*.*", target: { kind: "Static" }, fallback: { kind: "Compute", src: "default" } },
        { path: "/*", target: { kind: "Compute", src: "default" } },
      ],
      computeResources: [
        { name: "default", entrypoint: "index.mjs", runtime: "nodejs20.x" },
      ],
    },
    null,
    2,
  ),
);

console.log("[amplify-package] done -> .amplify-hosting/");
