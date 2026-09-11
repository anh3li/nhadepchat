/** Static HTML and RSC payloads are built once and served by Pages assets. */
const config = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { externalDir: true },
};
export default config;
