import { useEffect, useState } from "react";

export const R2 = "https://pub-3a8f85adfce6494097551ac5c045b121.r2.dev";
export const SUPABASE_CDN =
  "https://spheqdcagzndypxmqvuh.supabase.co/storage/v1/object/public/sorry-media";

export function mediaUrl(path: string): string {
  return `${R2}/${path}`;
}

export function fallbackMediaUrl(path: string): string {
  return `${SUPABASE_CDN}/${path}`;
}

/** Derive the Supabase fallback URL for any R2 URL */
export function toFallbackUrl(r2Url: string): string {
  if (r2Url.startsWith(R2)) {
    return r2Url.replace(R2, SUPABASE_CDN);
  }
  return r2Url;
}

/**
 * Returns the URL to use for a CSS background-image.
 * Starts with R2; if the image probe fails, falls back to Supabase.
 */
export function useCdnImage(path: string): string {
  const r2Url = `${R2}/${path}`;
  const supabaseUrl = `${SUPABASE_CDN}/${path}`;
  const [src, setSrc] = useState(r2Url);

  useEffect(() => {
    let cancelled = false;
    setSrc(r2Url);
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setSrc(r2Url);
    };
    img.onerror = () => {
      if (!cancelled) {
        if (import.meta.env.DEV) {
          console.warn(`[CDN fallback] R2 image failed → Supabase: ${path}`);
        }
        setSrc(supabaseUrl);
      }
    };
    img.src = r2Url;
    return () => {
      cancelled = true;
    };
  }, [path, r2Url, supabaseUrl]);

  return src;
}
