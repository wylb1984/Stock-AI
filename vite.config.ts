import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  
  // Capture API Key from Vercel (process.env) or local .env
  // We allow both 'API_KEY' and 'VITE_API_KEY' to be safe.
  const apiKey = process.env.API_KEY || process.env.VITE_API_KEY || env.API_KEY || env.VITE_API_KEY;

  if (apiKey) {
    console.log("✅ Build: API_KEY found and will be injected.");
  } else {
    console.warn("⚠️ Build: API_KEY is missing! App will fail at runtime.");
  }

  return {
    plugins: [react()],
    define: {
      // Create a global constant string that contains the key. 
      // This string replaces __API_KEY__ in your source code during build.
      '__API_KEY__': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
    }
  };
});