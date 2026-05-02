import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || ''),
      'process.env.GROK_API_KEY': JSON.stringify(env.GROK_API_KEY || env.VITE_GROK_API_KEY || ''),
      'process.env.VITE_GROK_API_KEY': JSON.stringify(env.VITE_GROK_API_KEY || env.GROK_API_KEY || ''),
      'process.env.VITE_ADMOB_BANNER_ID': JSON.stringify(env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-2044603074826844/3668941057'),
      'process.env.VITE_ADMOB_INTERSTITIAL_ID': JSON.stringify(env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-2044603074826844/7772005466'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
