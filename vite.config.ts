import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Served from https://<user>.github.io/aurion/ in production — the base must
// match the GitHub repo name. Keep the same base everywhere (dev + preview) so
// paths behave identically — `vite preview` reports its command as "serve", so a
// command-based switch would break it.
export default defineConfig({
  base: "/aurion/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "apple-touch-icon.png"],
      // Precache the home-screen background too, so it's there offline.
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg}"],
      },
      // scope + start_url are derived from `base` by the plugin.
      manifest: {
        name: "Aurion",
        short_name: "Aurion",
        description: "Count the days without, and pause before giving in.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
