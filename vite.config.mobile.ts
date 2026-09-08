import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "./",
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    tailwindcss(),
    react(),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
