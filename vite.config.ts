import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    // webExtension({
    //     manifest: generateManifest,
    //     watchFilePaths: ['package.json', 'manifest.json'],
    //     browser: 'chrome',
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/shared/types', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/shared/utils', import.meta.url)),
      '@/shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2022',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        devtools: resolve(__dirname, 'src/devtools/devtools.html'),
        panel: resolve(__dirname, 'src/devtools/panel.html'),
        'service-worker': resolve(
          __dirname,
          'src/background/service-worker.ts'
        ),
        content: resolve(__dirname, 'src/content/content-standalone.ts'),
      },
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: chunkInfo => {
          // Keep service worker and content scripts in their expected locations
          if (chunkInfo.name === 'service-worker') {
            return 'src/background/service-worker.js';
          }
          if (chunkInfo.name === 'content') {
            return 'src/content/content.js';
          }
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: 'assets/[name]-[hash].[ext]',
        format: 'es',
        manualChunks: id => {
          // Force content script to be bundled as a single chunk
          if (id.includes('src/content/content-standalone.ts')) {
            return 'content';
          }
        },
      },
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxImportSource: 'preact',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  optimizeDeps: {
    include: ['preact', '@preact/signals', 'date-fns', 'zod'],
  },
});
