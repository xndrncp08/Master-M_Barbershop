import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0a08",
    theme_color: "#0b0a08",
    icons: [
      { src: SITE.logo.src192, sizes: "192x192", type: "image/png" },
      { src: SITE.logo.src512, sizes: "512x512", type: "image/png" },
    ],
  };
}
