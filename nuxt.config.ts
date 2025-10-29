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
        // 1. Cor para Modo Claro (Light Mode)
        {
          name: "theme-color",
          content: "#2e65ffff", // Seu azul principal
          media: "(prefers-color-scheme: light)",
        },

        // 2. Cor para Modo Escuro (Dark Mode)
        {
          name: "theme-color",
          content: "#0a008fff", // Um azul escuro que harmonize com o Dark Mode
          media: "(prefers-color-scheme: dark)",
        },

        // 3. Cor para o bloco do Windows (msapplication-TileColor é um fallback)
        { name: "msapplication-TileColor", content: "#2e65ffff" },
      ],
    },
  },
});
