import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  
  // Prioritize Vercel system env vars, then local .env
  const apiKey = process.env.API_KEY || env.API_KEY;

  // Log for build debugging (visible in Vercel build logs)
  if (apiKey) {
    console.log("✅ API_KEY successfully detected in build environment.");
  } else {
    console.warn("⚠️ WARNING: API_KEY is missing in the build environment! The app will not function correctly.");
  }

  return {
    plugins: [react()],
    define: {
      // Strictly replace only the API_KEY. 
      // Do NOT define 'process.env' here as an object, as it conflicts with the specific key replacement.
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
    }
  };
});