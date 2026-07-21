import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Two separate HTML entry points, each carrying its own CSP in a <meta> tag.
 *
 * Why two documents instead of one SPA with two routes: a CSP is bound to the
 * document it arrives with. Client-side routing does not fetch a new document,
 * so a SPA cannot change its policy when navigating — both routes would share
 * whichever policy loaded first. Separate HTML files force a real document load,
 * which is the only way each page can carry a genuinely different policy.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // Fail loudly if the port is taken rather than drifting to 5175, where a
    // stale server would answer with a different policy.
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        blocked: resolve(__dirname, 'index.html'),
        fixed: resolve(__dirname, 'fixed.html'),
      },
    },
  },
});
