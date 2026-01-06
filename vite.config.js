
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Serve from root where index.html is
  build: {
    outDir: 'dist',
    minify: 'terser',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true
  }
});
