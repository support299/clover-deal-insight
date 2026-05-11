// AWS Amplify (Node SSR) build target.
// We disable the Cloudflare Workers plugin so the build emits a standard
// Node-compatible TanStack Start output that Amplify Hosting (Web Compute) can run.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
});
