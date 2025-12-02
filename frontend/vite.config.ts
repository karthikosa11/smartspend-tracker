import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env from parent directory (project root) or current directory
    const env = loadEnv(mode, process.cwd().includes('frontend') ? '../' : '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:5000/api')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './'),
        }
      },
      root: './',
      build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild', // Changed from 'terser' - esbuild is faster and included with Vite
      }
    };
});
