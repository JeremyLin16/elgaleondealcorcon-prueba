import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";
import { THEME } from "@/lib/theme";

// Served at /manifest.webmanifest ("add to home screen"). Icons are generated
// by scripts/images/brand.py.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "El Galeón",
    start_url: "/",
    display: "standalone",
    background_color: THEME.night,
    theme_color: THEME.night,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
