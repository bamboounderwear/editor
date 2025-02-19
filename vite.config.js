import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        email: resolve(__dirname, 'public/templates/email.html'),
        instagram: resolve(__dirname, 'public/templates/instagram.html'),
        slide: resolve(__dirname, 'public/templates/slide.html')
      }
    }
  },
  publicDir: 'public',
  assetsInclude: ['**/*.js'],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});