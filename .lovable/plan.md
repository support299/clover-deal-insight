## Plan

1. Add a dedicated server entry for the deployed app
- Create `src/server.ts` as the worker/server entry used in Lovable Cloud.
- Route all SSR requests through this wrapper instead of relying on the default hidden entry.

2. Capture otherwise-hidden SSR failures
- Add a tiny error-capture utility that listens for global server errors/unhandled promise rejections.
- Store the latest captured error briefly so swallowed SSR failures can still be logged.

3. Normalize catastrophic SSR responses
- In the new server entry, lazy-load the TanStack server handler.
- Catch pre-dispatch failures and log the real error.
- Detect generic framework 500/502-style responses (the swallowed `HTTPError` case) and replace them with a safe HTML fallback instead of a blank/generic server failure.

4. Wire the wrapper into the build used by Lovable Cloud
- Update `vite.config.ts` so TanStack Start uses `src/server.ts` as the server entry in the Lovable/Workers build.
- Update `wrangler.jsonc` to point to the same entry for consistency.

5. Add a root route error boundary
- Extend `src/routes/__root.tsx` with a proper `errorComponent` so render/load errors inside the React tree show a usable fallback and log the real error.

6. Verify the failure path
- Re-check the affected routes in preview/published mode.
- Confirm pages no longer collapse into opaque global server errors and that real server-side errors become inspectable.

## Why this plan
Your app currently has no custom SSR entry or server-side fallback layer in the worker runtime. In TanStack Start on Lovable Cloud, certain server failures can surface as generic site-wide 500/502 errors with little or no logging. This plan addresses that exact failure mode first, without changing your app’s business logic.

## Technical details
Files likely involved:
- `vite.config.ts`
- `wrangler.jsonc`
- `src/routes/__root.tsx`
- new: `src/server.ts`
- new: `src/lib/error-capture.ts`
- new: `src/lib/error-page.ts`

Expected outcome:
- No more opaque “any page returns 502” behavior for catastrophic SSR failures.
- Better server logging to reveal the real root cause if a specific dependency or route is crashing.
- Safer fallback experience instead of a generic upstream error page.