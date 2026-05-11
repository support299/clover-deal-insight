#!/usr/bin/env node
// Packages the TanStack Start build for AWS Amplify Hosting (Web Compute / SSR).
//
// Output layout:
//   .amplify-hosting/
//     deploy-manifest.json
//     static/                    (served as static assets)
//     compute/default/
//       index.mjs                (Node http server wrapping the fetch handler)
//       package.json             (production deps only)
//       server/                  (copy of dist/server, no .map / .d.ts)
//       node_modules/            (installed via `npm install --omit=dev`)

import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const dist = join(root, "dist");
const out = join(root, ".amplify-hosting");
const SIZE_LIMIT_MB = 230;

if (!existsSync(join(dist, "client")) || !existsSync(join(dist, "server"))) {
  console.error("[amplify-package] dist/client or dist/server missing. Run vite build first.");
  process.exit(1);
}

console.log("[amplify-package] cleaning .amplify-hosting");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Filter to skip source maps and .d.ts when copying build outputs
const noMaps = (src) => !src.endsWith(".map") && !src.endsWith(".d.ts");

// 1. static
console.log("[amplify-package] copying static assets");
cpSync(join(dist, "client"), join(out, "static"), { recursive: true, filter: noMaps });

// 2. compute/default
const compute = join(out, "compute", "default");
mkdirSync(compute, { recursive: true });

console.log("[amplify-package] copying server bundle");
cpSync(join(dist, "server"), join(compute, "server"), { recursive: true, filter: noMaps });

// 3. compute package.json — production deps only (copied from root package.json)
const rootPkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const computePkg = {
  name: "amplify-compute",
  private: true,
  type: "module",
  dependencies: rootPkg.dependencies || {},
};
writeFileSync(join(compute, "package.json"), JSON.stringify(computePkg, null, 2));

// 4. install production dependencies into compute/
console.log("[amplify-package] installing production dependencies (npm install --omit=dev)");
const npmResult = spawnSync(
  "npm",
  ["install", "--omit=dev", "--legacy-peer-deps", "--no-audit", "--no-fund", "--ignore-scripts"],
  { cwd: compute, stdio: "inherit", env: { ...process.env, npm_config_loglevel: "error" } },
);
if (npmResult.status !== 0) {
  console.error("[amplify-package] npm install failed");
  process.exit(npmResult.status || 1);
}

// 5. Prune known dev/build-only packages that may sneak in as transitive deps
const devPackages = [
  "@types",
  "typescript",
  "prettier",
  "eslint",
  "vite",
  "@vitejs",
  "vitest",
  "@testing-library",
  "esbuild",
  "@esbuild",
  "rollup",
  "@rollup",
  "terser",
  "@swc",
];
const nm = join(compute, "node_modules");
for (const pkg of devPackages) {
  const p = join(nm, pkg);
  if (existsSync(p)) {
    console.log(`[amplify-package] removing ${pkg}`);
    rmSync(p, { recursive: true, force: true });
  }
}

// 6. Recursively delete .map and .d.ts files from compute (incl. node_modules)
function pruneFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      pruneFiles(p);
    } else if (e.isFile() && (e.name.endsWith(".map") || e.name.endsWith(".d.ts") || e.name.endsWith(".md") || e.name.endsWith(".markdown"))) {
      try { unlinkSync(p); } catch {}
    }
  }
}
console.log("[amplify-package] pruning .map / .d.ts / .md files");
pruneFiles(compute);

// 7. compute entrypoint — Node http server bridging req/res <-> fetch
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

// 8. deploy-manifest.json (Amplify Hosting compute spec)
writeFileSync(
  join(out, "deploy-manifest.json"),
  JSON.stringify(
    {
      version: 1,
      framework: { name: "tanstack-start", version: "1.0.0" },
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

// 9. Report final size and validate against limit
function dirSize(dir) {
  let total = 0;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) total += dirSize(p);
    else if (e.isFile()) {
      try { total += statSync(p).size; } catch {}
    }
  }
  return total;
}

const computeBytes = dirSize(compute);
const totalBytes = dirSize(out);
const computeMB = (computeBytes / 1024 / 1024).toFixed(1);
const totalMB = (totalBytes / 1024 / 1024).toFixed(1);

console.log(`[amplify-package] compute/default size: ${computeMB} MB`);
console.log(`[amplify-package] total .amplify-hosting size: ${totalMB} MB`);

if (computeBytes / 1024 / 1024 > SIZE_LIMIT_MB) {
  console.error(`[amplify-package] WARNING: compute bundle (${computeMB} MB) exceeds ${SIZE_LIMIT_MB} MB limit`);
}

console.log("[amplify-package] done -> .amplify-hosting/");
