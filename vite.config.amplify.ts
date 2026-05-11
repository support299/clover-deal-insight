// Amplify-specific Vite config that does NOT import @lovable.dev/vite-tanstack-config
// (which transitively imports lovable-tagger -> tailwindcss v3, breaking Amplify builds).
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    define[`import.meta.env.${k}`] = JSON.stringify(v);
  }

  return {
    define,
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart(),
      viteReact(),
    ],
    build: {
      sourcemap: false,
      minify: "esbuild",
      chunkSizeWarningLimit: 1000,
      target: "esnext",
      cssCodeSplit: true,
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.message?.includes("is imported from external module")) return;
          warn(warning);
        },
        output: {
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;
            if (id.includes("recharts") || id.includes("d3-")) return "vendor-recharts";
            if (id.includes("react-hook-form") || id.includes("@hookform")) return "vendor-forms";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("date-fns")) return "vendor-date-fns";
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("@tanstack")) return "vendor-tanstack";
            if (id.includes("lucide-react")) return "vendor-icons";
            return "vendor-common";
          },
        },
      },
    },
  };
});
