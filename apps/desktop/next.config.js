/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — Tauri serves the built HTML/JS/CSS locally via file:// protocol
  output: "export",

  // No image optimization needed for a local desktop app
  images: { unoptimized: true },

  // Ensure asset paths work under file:// in production
  trailingSlash: true,

  // Transpile the shared core package (npm workspace symlink)
  transpilePackages: ["@splitforge/core"],
};

module.exports = nextConfig;
