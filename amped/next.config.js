/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Tauri requires static export
  distDir: 'out',
}

module.exports = nextConfig
