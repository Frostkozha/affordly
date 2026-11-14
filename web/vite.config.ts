import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { cloudflare } from "@cloudflare/vite-plugin";

// BASE_PATH is set by the GitHub Pages build ("/affordly/"); everywhere else the site is served from "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), cloudflare()],
  worker: { format: 'es' },
})