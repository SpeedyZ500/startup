import { defineConfig } from 'vite';
import path from 'path';


export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/ws': {
        target: 'ws://localhost:4000',
        ws: true,
      },
    },
    
  },
  build:{
    rollupOptions:{
      input:{
        main: path.resolve(__dirname, 'index.html'),
        login: path.resolve(__dirname, 'login.html'),
      }
    }
  }
});
