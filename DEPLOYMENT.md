# AWS Amplify Deployment Guide

This app is configured to deploy on **AWS Amplify Hosting (SSR / Web Compute)** with **Supabase Cloud** as the backend.

## 1. Connect the repo

1. AWS Console → **Amplify** → **New app → Host web app**
2. Connect GitHub/GitLab/Bitbucket/CodeCommit and select this repo + branch (e.g. `main`).
3. Amplify auto-detects `amplify.yml`. Confirm framework as **TanStack Start** (or generic Vite SSR / Web Compute).
4. Amplify creates an internal pipeline that auto-builds on every push to the connected branch.

## 2. Environment variables (App settings → Environment variables)

Public (baked into client bundle at build time):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Server-only (used by `createServerFn` handlers / server routes):
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GHL_CLIENT_SECRET`
- Any other secrets currently configured in Lovable Cloud

Copy values from your existing Supabase project (Settings → API) and from current Lovable Cloud secrets.

## 3. Supabase configuration

In the Supabase dashboard:
- **Authentication → URL Configuration**: add the Amplify URL (`https://<branch>.<app-id>.amplifyapp.com`) and your custom domain to **Site URL** and **Additional redirect URLs**.
- **API → CORS**: allow the new origin(s).
- Update any GoHighLevel OAuth redirect / webhook URLs to the new domain.

No database, RLS, or migration changes needed.

## 4. Custom domain (keep current DNS provider)

1. Amplify → **Domain management → Add domain** → enter `pinnaclewellnessgroup.trysaasyway.com` (and apex if used).
2. Amplify shows CNAME records (one for the app, one for ACM cert verification).
3. In your DNS provider, add the CNAMEs exactly as shown.
4. Wait for verification — Amplify auto-issues the ACM certificate and serves HTTPS.
5. Remove old Lovable A records once Amplify domain is `Active`.

## 5. After cutover

- Update the GHL webhook URLs to point at the Amplify domain.
- Retire the previous Lovable-published URL.

## Local notes

- Build command: `npm run build` (output in `dist/`).
- The Cloudflare Workers target has been removed (`wrangler.jsonc` deleted, `@cloudflare/vite-plugin` uninstalled, `vite.config.ts` sets `cloudflare: false`).
- Supabase clients are unchanged — same project, same data.
