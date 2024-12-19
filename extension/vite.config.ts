import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/worker.ts'),
        content: resolve(__dirname, 'src/content/main.ts'),
        popup: resolve(__dirname, 'src/popup/index.html'),
        sidebar: resolve(__dirname, 'src/sidebar/index.html'),
        styles: resolve(__dirname, 'src/styles/content.css')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/background.js';
          }
          if (chunkInfo.name === 'content') {
            return 'content/content.js';
          }
          return '[name]/[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content.css') {
            return 'styles/content.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}); 