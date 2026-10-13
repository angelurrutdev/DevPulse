// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  server: {
    host: true,
    port: 4321,
  },
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 30,
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
