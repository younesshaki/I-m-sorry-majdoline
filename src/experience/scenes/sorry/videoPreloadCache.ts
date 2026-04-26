import { sorrySceneAssets } from "./data/sceneAssets";

export type VideoPreloadStatus = "idle" | "loading" | "ready" | "error";

export type VideoPreloadSnapshot = {
  status: VideoPreloadStatus;
  /** 0–100, based on real bytes downloaded for the two required videos */
  progress: number;
  error: string | null;
};

const allVideos = sorrySceneAssets.video.blenderScenes;

// blenderscene1 (~50 MB) + blenderscene2 (~21 MB) must be fully in memory before the chapter opens.
// The remaining three download silently in the background while she watches the first scenes.
const REQUIRED = allVideos.slice(0, 2);
const BACKGROUND = allVideos.slice(2);

// Approximate sizes for progress estimation before real Content-Length arrives.
const APPROX_SIZES: Record<string, number> = {
  [allVideos[0]]: 52_000_000, // blenderscene1 ~50 MB
  [allVideos[1]]: 22_200_000, // blenderscene2 ~21 MB
};

const blobUrls = new Map<string, string>();
const subscribers = new Set<(s: VideoPreloadSnapshot) => void>();

let status: VideoPreloadStatus = "idle";
let progress = 0;
let error: string | null = null;
let activePromise: Promise<void> | null = null;

function snap(): VideoPreloadSnapshot {
  return { status, progress, error };
}

function notify() {
  const s = snap();
  subscribers.forEach((fn) => fn(s));
}

// Fetch one video as a blob, streaming so we can report byte progress.
// Falls back gracefully — if anything fails, blobUrls stays empty for that URL
// and getSorryVideoSource returns the original CDN URL instead.
async function fetchBlob(
  url: string,
  onBytes?: (loaded: number, total: number) => void
): Promise<void> {
  if (blobUrls.has(url)) return;

  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

    const contentLength = Number(res.headers.get("content-length") ?? 0);
    const total = contentLength || (APPROX_SIZES[url] ?? 30_000_000);

    // Refine our approximation with the real header
    if (contentLength && APPROX_SIZES[url] !== contentLength) {
      APPROX_SIZES[url] = contentLength;
    }

    const reader = res.body.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let loaded = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      onBytes?.(loaded, total);
    }

    const blob = new Blob(chunks, { type: "video/mp4" });
    blobUrls.set(url, URL.createObjectURL(blob));
  } catch {
    // Non-fatal: leave blobUrls empty so getSorryVideoSource falls back to CDN URL.
  }
}

async function run(): Promise<void> {
  // Phase 1 — required: blocks the preloader gate
  const totalApprox = REQUIRED.reduce((n, u) => n + (APPROX_SIZES[u] ?? 30_000_000), 0);
  const perLoaded = new Map<string, number>(REQUIRED.map((u) => [u, 0]));

  const onBytes = (url: string, loaded: number) => {
    perLoaded.set(url, loaded);
    const sum = Array.from(perLoaded.values()).reduce((a, b) => a + b, 0);
    progress = Math.min(99, Math.round((sum / totalApprox) * 100));
    notify();
  };

  await Promise.all(
    REQUIRED.map((url) => fetchBlob(url, (loaded) => onBytes(url, loaded)))
  );

  progress = 100;
  status = "ready";
  notify();

  // Phase 2 — background: non-blocking, no progress updates
  void Promise.allSettled(BACKGROUND.map((url) => fetchBlob(url)));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function subscribeToSorryVideoPreload(
  fn: (s: VideoPreloadSnapshot) => void
): () => void {
  subscribers.add(fn);
  fn(snap());
  return () => subscribers.delete(fn);
}

export function preloadSorryBackgroundVideos(): Promise<void> {
  if (status === "ready") return Promise.resolve();
  if (activePromise) return activePromise;

  status = "loading";
  error = null;
  progress = 0;
  notify();

  activePromise = run()
    .catch((err: unknown) => {
      status = "error";
      error = err instanceof Error ? err.message : "Could not load videos";
      notify();
    })
    .finally(() => {
      activePromise = null;
    });

  return activePromise;
}

/** Returns the in-memory blob URL if pre-fetched, otherwise the original CDN URL. */
export function getSorryVideoSource(url: string): string {
  return blobUrls.get(url) ?? url;
}
