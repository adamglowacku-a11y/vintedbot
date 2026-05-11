import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function copyExtensionAssets(): Plugin {
  return {
    name: "copy-extension-assets",
    closeBundle() {
      const root = resolve(__dirname);
      const outDir = resolve(root, "dist");

      copyFileSync(resolve(root, "manifest.json"), resolve(outDir, "manifest.json"));

      const publicDir = resolve(root, "public");
      const copyDir = (from: string, to: string) => {
        mkdirSync(to, { recursive: true });
        for (const entry of readdirSync(from, { withFileTypes: true })) {
          const source = join(from, entry.name);
          const target = join(to, entry.name);

          if (entry.isDirectory()) {
            copyDir(source, target);
          } else {
            mkdirSync(dirname(target), { recursive: true });
            copyFileSync(source, target);
          }
        }
      };

      copyDir(publicDir, outDir);
    }
  };
}

export default defineConfig({
  root: __dirname,
  envDir: resolve(__dirname, ".."),
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [react(), copyExtensionAssets()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        "background/service-worker": resolve(__dirname, "src/background/service-worker.ts"),
        "content/vinted": resolve(__dirname, "src/content/vinted.ts"),
        "content/dashboard-bridge": resolve(__dirname, "src/content/dashboard-bridge.ts")
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  },
  define: {
    __EXTENSION_VERSION__: JSON.stringify("0.1.0")
  }
});
