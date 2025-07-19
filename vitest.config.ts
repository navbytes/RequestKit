import { resolve } from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment setup
    environment: 'jsdom',

    // Global test setup
    setupFiles: ['./src/__tests__/setup.ts'],

    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'dev-dist',
      '.idea',
      '.git',
      '.cache',
      'src/__tests__/setup.ts',
      'src/__tests__/__mocks__/**',
      'src/__tests__/fixtures/**',
      'src/__tests__/utils/**',
    ],

    // Global test configuration
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'dev-dist/',
        'src/__tests__/',
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/assets/',
        'src/devtools/devtools.html',
        'src/devtools/panel.html',
        'manifest.json',
        'postcss.config.js',
        '*.config.{js,ts}',
        'src/content/injected-script.ts', // Browser-injected script
        'src/shared/theme-init.js', // Theme initialization script
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Chrome extension specific settings
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Chrome API mocking works better with single thread
      },
    },

    // Mock configuration
    deps: {
      inline: [
        // Inline dependencies that need to be transformed
        '@testing-library/preact',
        '@testing-library/jest-dom',
      ],
    },

    // Browser-like environment for Chrome extension testing
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously',
      },
    },
  },

  // Path resolution matching main project configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/types': resolve(__dirname, './src/shared/types'),
      '@/utils': resolve(__dirname, './src/shared/utils'),
      '@/shared': resolve(__dirname, './src/shared'),
    },
  },

  // Define global constants for Chrome extension environment
  define: {
    __DEV__: true,
    __TEST__: true,
  },

  // ESBuild configuration for TypeScript
  esbuild: {
    target: 'es2022',
  },
});
