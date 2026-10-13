import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  // Browser contract tests always use a public, deliberately invalid fixture key.
  // They intercept all Supabase requests; no developer credentials are required.
  define: mode === 'e2e' ? {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://vvwzqehzamkflrokrcqs.supabase.co'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('sb_publishable_synthetic_e2e_only'),
  } : {},
  plugins: [react(), {
    name: 'local-dev-style-policy',
    apply: 'serve',
    // Vite HMR injects inline styles on the local dev server only.
    // Keep the production HTML policy restrictive and entirely self-hosted.
    transformIndexHtml(html) { return html.replace("style-src 'self';", "style-src 'self' 'unsafe-inline';"); },
  }],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
}));
