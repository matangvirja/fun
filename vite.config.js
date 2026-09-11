import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // No source maps in production to avoid exposing source code
    sourcemap: false,
    // Tune chunk size warning limit (some vendor chunks are legitimately large)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal long-term caching:
        // Each chunk is cached independently — a UI library update won't bust the React cache.
        manualChunks(id) {
          // Supabase client — large, infrequently updated
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          // TanStack Query — stable data-fetching runtime
          if (id.includes('node_modules/@tanstack')) {
            return 'tanstack';
          }
          // Radix UI component primitives — stable UI layer
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }
          // Heavy chart / visualization libraries
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'charts';
          }
          // Framer Motion animation engine
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Three.js (3D) — only loaded when needed
          if (id.includes('node_modules/three')) {
            return 'three';
          }
          // PDF / canvas utilities — large, only used in admin invoice
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'pdf-utils';
          }
          // Stripe — payment SDK
          if (id.includes('node_modules/@stripe')) {
            return 'stripe';
          }
          // Everything else from node_modules (incl. React, react-dom, react-router) → vendor
          // Note: React is intentionally kept in vendor to avoid circular chunk dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
