import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        email: 'public/templates/email.html',
        instagram: 'public/templates/instagram.html',
        slide: 'public/templates/slide.html'
      }
    }
  }
});