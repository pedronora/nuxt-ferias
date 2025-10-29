import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  css: ["bootstrap/dist/css/bootstrap.min.css"],
  typescript: { strict: true },
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        // Basic favicon
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },

        // Standard sizes
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },

        // Apple devices
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },

        // Android devices
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/android-chrome-192x192.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "512x512",
          href: "/android-chrome-512x512.png",
        },

        // Web App Manifest
        { rel: "manifest", href: "/site.webmanifest" },
      ],
      meta: [
        // Theme colors for mobile browsers
        { name: "theme-color", content: "#4a7affff" },
        { name: "msapplication-TileColor", content: "#4a7affff" },
      ],
    },
  },
});
