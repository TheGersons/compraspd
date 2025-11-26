import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr({ svgrOptions: { icon: true, exportType: 'named', namedExport: 'ReactComponent' } })],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.3.38:3001',  // o 'http://backend:3001' si usas nombre de contenedor
        changeOrigin: true,
      },
    },
  },
});