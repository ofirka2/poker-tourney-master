// src/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  base: '/',   // Chosen base path: absolute root for hosting like Vercel
  server: {
    host: '::',
    port: 8080,
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
}));