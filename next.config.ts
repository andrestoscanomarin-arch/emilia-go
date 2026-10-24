import type { NextConfig } from "next";

/**
 * Con PAGES=1 se arma una versión estática para GitHub Pages (sin servidor).
 * En esa versión Emilia usa siempre los respaldos: intérprete local y voz del navegador.
 */
const paraPages = process.env.PAGES === "1";
const basePath = paraPages ? "/emilia-go" : "";

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(paraPages && {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_ESTATICO: paraPages ? "1" : "",
  },
};

export default nextConfig;
