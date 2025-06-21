<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 85734bd3e1d49194c296795590515243b8f29e23
// src/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  // base: './', // Comment this out or change
  base: '/',   // Test with this
  server: {
    host: '::',
    port: 8080,
<<<<<<< HEAD
=======
=======

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  base: './', // Use relative paths
  server: {
    host: "::",
    port: 8080
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
>>>>>>> 85734bd3e1d49194c296795590515243b8f29e23
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
<<<<<<< HEAD
}));
=======
<<<<<<< HEAD
}));
=======
  // Define environment variables that should be exposed to the client
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
    'import.meta.env.VITE_DEFAULT_PLAYER_COUNT': JSON.stringify(process.env.VITE_DEFAULT_PLAYER_COUNT || '9'),
    'import.meta.env.VITE_DEFAULT_TOURNAMENT_DURATION': JSON.stringify(process.env.VITE_DEFAULT_TOURNAMENT_DURATION || '4'),
    'import.meta.env.VITE_DEFAULT_BUY_IN_AMOUNT': JSON.stringify(process.env.VITE_DEFAULT_BUY_IN_AMOUNT || '100'),
    'import.meta.env.VITE_DEFAULT_ALLOW_REBUY': JSON.stringify(process.env.VITE_DEFAULT_ALLOW_REBUY || 'true'),
    'import.meta.env.VITE_DEFAULT_ALLOW_ADDON': JSON.stringify(process.env.VITE_DEFAULT_ALLOW_ADDON || 'true'),
  },
}))
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
>>>>>>> 85734bd3e1d49194c296795590515243b8f29e23
