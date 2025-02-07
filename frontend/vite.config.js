import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@app': '/src/App',
      '@globalStyles': '/src/styles/global.css',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    commonjsOptions: {
      ignoreDynamicRequires: true,
    },
    minify: 'esbuild',
    cssCodeSplit: true,
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'js/app.js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'css/global.css',
      },
    },
  },
});
