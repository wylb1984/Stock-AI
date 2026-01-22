import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third argument '' loads all env vars, regardless of prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Capture API Key from Vercel (process.env) or local .env
  // We allow both 'API_KEY' and 'VITE_API_KEY'.
  const apiKey = process.env.API_KEY || process.env.VITE_API_KEY || env.API_KEY || env.VITE_API_KEY;

  if (apiKey) {
    console.log("✅ Build: API_KEY found and will be injected as process.env.API_KEY.");
  } else {
    console.warn("⚠️ Build: API_KEY is missing! The app will fail at runtime.");
  }

  return {
    plugins: [react()],
    define: {
      // Shim process.env.API_KEY so it is available in the browser.
      // JSON.stringify ensures the value is embedded as a string literal (e.g. "AIzaSy...").
      'process.env.API_KEY': JSON.stringify(apiKey || ""),
    },
    build: {
      outDir: 'dist',
    }
  };
});