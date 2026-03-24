/** @type {import('next').NextConfig} */
const nextConfig = {
  // apps/web is fully self-contained — no workspace packages to transpile.
  // Tauri-specific code lives only in apps/desktop and is never imported here.
};

module.exports = nextConfig;
