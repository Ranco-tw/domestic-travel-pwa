import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "旅途收藏",
    short_name: "旅途收藏",
    description: "收藏回憶，規劃屬於我們的旅程",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F3EA",
    theme_color: "#6F7D4D",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
