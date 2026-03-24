/** @type {import('next').NextConfig} */
const nextConfig = {
  // Web Workers using `new URL('./workers/...', import.meta.url)` are
  // bundled automatically by Next.js/webpack — no extra config needed.

  // This app is fully self-contained: no workspace packages, no Tauri.
};

module.exports = nextConfig;
