import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 5173,
    // Security headers for development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  preview: {
    headers: {
      // Security headers for production preview
      'Content-Security-Policy': [
        "default-src 'self'",
        "img-src 'self' data: https://*.inaturalist.org https://commons.wikimedia.org https://upload.wikimedia.org https://*.tile.openstreetmap.org",
        "connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud wss://*.convex.site",
        "script-src 'self' 'unsafe-inline'", // unsafe-inline needed for Vite in production
        "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for styled components
        "font-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(self), camera=(self), microphone=()',
    },
  },
})