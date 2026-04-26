import { useEffect, useRef } from "react";
import gsap from "gsap";

const OUTSIDE_SORRY_MUSIC_URL =
  "https://spheqdcagzndypxmqvuh.supabase.co/storage/v1/object/public/sorry-media/audio/bts-fake-love-orchestral-slowed-reverb-v1.mp3";

const TARGET_VOLUME = 0.2;
const FADE_IN_S = 4.5;
const FADE_OUT_S = 2.8;

export function OutsideSorryMusic({ enabled }: { enabled: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // True only when we deliberately paused it (fade-out) — distinguishes our pauses from browser pauses
  const intentionalPauseRef = useRef(false);
  const playingRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(OUTSIDE_SORRY_MUSIC_URL);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;

    // If the browser pauses us without our consent, immediately try to resume
    const onUnexpectedPause = () => {
      if (intentionalPauseRef.current || !playingRef.current) return;
      void audio.play().catch(() => {});
    };
    audio.addEventListener("pause", onUnexpectedPause);

    return () => {
      audio.removeEventListener("pause", onUnexpectedPause);
      gsap.killTweensOf(audio);
      intentionalPauseRef.current = true;
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      playingRef.current = false;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      intentionalPauseRef.current = false;

      const startPlaying = () => {
        const a = audioRef.current;
        if (!a || !enabled) return;
        void a.play()
          .then(() => {
            playingRef.current = true;
            gsap.killTweensOf(a);
            gsap.to(a, { volume: TARGET_VOLUME, duration: FADE_IN_S, ease: "power2.out" });
          })
          .catch(() => {
            // Browser blocked it — next interaction will retry since listeners are not { once }
            playingRef.current = false;
          });
      };

      // Already playing smoothly — nothing to do
      if (playingRef.current && !audio.paused) return;

      // Was playing but got paused externally — resume now
      if (playingRef.current && audio.paused) {
        startPlaying();
        return;
      }

      // Not yet started — wait for first meaningful user gesture, keep retrying until it works
      window.addEventListener("pointerdown", startPlaying, { passive: true });
      window.addEventListener("keydown", startPlaying);

      // Also resume when tab comes back into focus after being backgrounded
      const onVisibilityChange = () => {
        if (document.visibilityState === "visible") startPlaying();
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
        window.removeEventListener("pointerdown", startPlaying);
        window.removeEventListener("keydown", startPlaying);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    }

    // Disabled — our deliberate fade-out and pause
    intentionalPauseRef.current = true;
    gsap.killTweensOf(audio);
    gsap.to(audio, {
      volume: 0,
      duration: FADE_OUT_S,
      ease: "power2.in",
      onComplete: () => {
        audio.pause();
        playingRef.current = false;
      },
    });
  }, [enabled]);

  return null;
}
