import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
//import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // permite usar describe/it/expect sin imports
    environment: "jsdom", // simula el navegador
    setupFiles: "./src/test/setup.js", // archivo de configuración inicial
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
    server: {
      deps: {
        inline: ["@mui/material"],
      },
    },
  },
});
