# AWS Amplify Hosting Migration Plan

Goal: deploy this TanStack Start app on **AWS Amplify Hosting (SSR)** with **Supabase Cloud** as the backend, auto-deployed by Amplify, custom domain pointed from your existing DNS provider.

---

## 1. Swap the server runtime: Cloudflare Worker → Node (Lambda)

Today the app builds for Cloudflare Workers via `@cloudflare/vite-plugin` (configured implicitly by `@lovable.dev/vite-tanstack-config`) and `wrangler.jsonc`. Amplify SSR runs Node.js on Lambda, not Workers.

Changes:
- Remove the Cloudflare target by overriding `@lovable.dev/vite-tanstack-config` in `vite.config.ts` to disable the `cloudflare` plugin and emit a Node SSR build instead.
- Delete `wrangler.jsonc` (Worker-specific).
- Remove `@cloudflare/vite-plugin` from `package.json`.
- Add a small Node server entry (`server.js`) that imports `@tanstack/react-start/server-entry` and serves it via the standard Web `fetch` → Node adapter, so Amplify's SSR Lambda can invoke it.
- Keep the existing SSR error-handling wrapper pattern (lazy import + try/catch + response normalizer) in `src/server.ts` — it works the same way under Node.

Result: build output is a static client bundle in `dist/client` plus a Node SSR handler in `dist/server` — the shape Amplify SSR expects.

## 2. Amplify Hosting configuration

Add an `amplify.yml` at the repo root telling Amplify how to build and where the artifacts live:

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

Set the framework to "TanStack Start (SSR)" / "Web Compute" in the Amplify console so it provisions a Lambda for the SSR handler and CloudFront in front of it.

## 3. Connect the repo and enable auto-deploy (CodePipeline-style, AWS-native)

In the AWS Amplify console:
1. **New app → Host web app**
2. Connect the GitHub/GitLab/Bitbucket/CodeCommit repo for this project
3. Pick the branch (e.g. `main`) — Amplify wires up its own pipeline that auto-builds on every push (no separate CodePipeline needed; this is the AWS-native auto-deploy you asked for)
4. Add the env vars below
5. First build deploys to `https://main.<app-id>.amplifyapp.com`

## 4. Environment variables in Amplify

Set these in **App settings → Environment variables**:

Public (build-time, baked into client bundle):
- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` = current publishable/anon key
- `VITE_SUPABASE_PROJECT_ID` = `oogriwahzwovqukbnsdm`

Server-only (used by `createServerFn` handlers):
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GHL_CLIENT_SECRET` (already in use)
- Any other secrets currently in Lovable Cloud secrets

You'll copy the values out of Lovable Cloud once and paste them into Amplify. Supabase itself doesn't move — same project, same data, same URL.

## 5. Supabase configuration updates

Supabase stays on supabase.com; only two things need to change in the Supabase dashboard so it accepts traffic from the new origin:
- **Auth → URL Configuration**: add the Amplify URL and your custom domain to **Site URL** and **Additional redirect URLs**
- **API → CORS** (and any GHL OAuth redirect): allow the new origin(s)

No database, RLS, or migration changes are required.

## 6. Custom domain (keep current DNS provider)

In Amplify:
1. **Domain management → Add domain** → enter `pinnaclewellnessgroup.trysaasyway.com` (and/or apex)
2. Amplify shows you a CNAME (and a verification CNAME for ACM certificate issuance)
3. In your current DNS provider, add those CNAME records exactly as shown
4. Wait for verification — Amplify auto-issues the ACM cert and serves HTTPS

The Lovable custom-domain records (currently pointing at Lovable's IP) get replaced by the Amplify CNAMEs. After cutover, the Lovable-published URL is no longer the source of truth.

## 7. Things that need a quick audit before first deploy

- **Server runtime check**: confirm no server function uses Cloudflare-specific globals (`env` bindings, `caches.default`, etc.). A grep through `src/lib/*.functions.ts`, `src/lib/*.server.ts`, and `src/routes/api/public/*` during implementation; replace any with Node equivalents.
- **Webhook URLs**: `src/routes/api/public/hooks/ghl-webhook.ts` and `ghl-refresh.ts` are currently reachable at the Lovable URL. After cutover, update GHL's webhook config to point at the new Amplify domain.
- **`scripts/*.ts`** (`backfill-ghl-contacts`, `import-ghl-users`) — these are local one-offs, unaffected by hosting change.

## 8. Cutover order (zero-downtime-ish)

1. Land the code changes (new vite config, `server.js`, `amplify.yml`, removed wrangler).
2. Push to the branch connected to Amplify → first successful build → test on `*.amplifyapp.com`.
3. Update Supabase Auth redirect URLs + GHL webhook URLs to include the Amplify URL.
4. Add the custom domain in Amplify, paste CNAMEs into your DNS provider.
5. Once DNS propagates and HTTPS is live on the custom domain, you're done. The Lovable-published URL can be retired.

---

## Technical details (reference)

**Files added/modified:**
- `vite.config.ts` — disable Cloudflare plugin, configure Node SSR output
- `src/server.ts` — keep wrapper, swap export shape from Worker `{ fetch }` to Node-compatible handler
- `server.js` (new, repo root) — Node entry that boots the SSR handler for Amplify Lambda
- `amplify.yml` (new) — build spec
- `wrangler.jsonc` — deleted
- `package.json` — drop `@cloudflare/vite-plugin`, add Node SSR adapter deps as needed

**Files unchanged:** all `src/routes/**`, `src/components/**`, all Supabase migrations, `src/integrations/supabase/*`, GHL functions.

**Cost shape:** Amplify Hosting bills per build-minute + per GB served + per SSR request (Lambda + CloudFront). For an app this size expect single-digit USD/month at low traffic. Supabase costs unchanged.

**What this plan does NOT do:** move data off Supabase, set up Route 53, set up a separate CodePipeline (Amplify's built-in pipeline is the AWS-native option), containerize the app, or change any application logic.
