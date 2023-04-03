import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [basicSsl(), react()],

  server: {
    proxy: {
      "/myapp/login": {
        target: "https://localhost:8080/",
        changeOrigin: true,
        secure: false,
        logger: console,
      },

      "/datasocket": {
        target: "wss://localhost:8080/",
        ws: true,
        changeOrigin: true,
        secure: false,
        logger: console,
      },
    },
  },
});
