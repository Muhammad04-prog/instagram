import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    /**
     * The backend keeps uploads in object storage (MinIO) and hands back
     * absolute URLs. Only the API host is listed here because that is the only
     * origin we have seen — the storage host is still unknown, since the
     * database and storage have been down since the migration started and no
     * real media URL has ever come back. Add it here the moment one does:
     * <Image> refuses any host not on this list.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "instagram-api.softclub.tj",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "backend-instagram-a4k6.onrender.com",
        pathname: "/**",
      },
      /**
       * Spotify album art. `SpotifyTrackDto.albumCover` is Spotify's own CDN —
       * the track is not ours until it is imported, so the cover is served from
       * their host and this entry is what lets <Image> render it at all.
       */
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-images.dzcdn.net",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
