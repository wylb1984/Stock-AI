import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');
  
  // Vercel injects environment variables into process.env. 
  // We prioritize process.env.API_KEY, then fall back to the loaded env.
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // Securely expose the API_KEY to the client-side code
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Define a safe fallback for process.env to prevent "process is not defined" errors
      'process.env': JSON.stringify({}),
    },
    build: {
      outDir: 'dist',
    }
  };
});