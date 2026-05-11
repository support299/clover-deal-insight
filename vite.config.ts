// Default build target keeps the Cloudflare Workers plugin enabled so Lovable's
// preview/publish pipeline (which runs on Workers) keeps working.
//
// For AWS Amplify (Node SSR), set the env var AMPLIFY=1 at build time to
// disable the Cloudflare plugin and emit a Node-compatible TanStack Start
// output. amplify.yml sets this automatically.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isAmplify = process.env.AMPLIFY === "1";

export default defineConfig({
  cloudflare: isAmplify ? false : undefined,
  tanstackStart: {
    server: { entry: "server" },
  },
});
