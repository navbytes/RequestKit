import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: 'src',
  server: {
    port: 3000,
    open: '/options/index.dev.html',
    hmr: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/shared/types', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/shared/utils', import.meta.url)),
      '@/shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  build: {
    outDir: '../dev-dist',
    sourcemap: true,
    minify: false,
    target: 'es2022',
    rollupOptions: {
      input: {
        options: 'src/options/index.dev.html',
        popup: 'src/popup/index.dev.html',
      },
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxImportSource: 'preact',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  optimizeDeps: {
    include: ['preact', '@preact/signals', 'date-fns', 'zod'],
  },
});
