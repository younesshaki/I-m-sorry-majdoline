import { useEffect, useRef } from "react";
import { sorrySceneAssets } from "./data/sceneAssets";

type BackgroundVideoProps = {
  isVisible?: boolean;
};

// Increase this toward 1 to make the background video darker.
const BACKGROUND_VIDEO_DARKNESS = 0.9;
// Increase this if the loop still flashes near the end.
const LOOP_END_TRIM_SECONDS = 0.3;
const LOOP_RESTART_TIME_SECONDS = 1;
// Increase these to make the blur blend more gradually.
const LOOP_BLUR_OUT_SECONDS = 3.2;
const LOOP_BLUR_IN_SECONDS = 3.2;
// Increase this for a stronger blur right before the loop jump.
const LOOP_MAX_BLUR_PX = 60;

export function BackgroundVideo({ isVisible = true }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let rafId = 0;
    let isBlurringIn = false;
    let blurInStartedAt = 0;

    const tick = () => {
      if (isBlurringIn) {
        const elapsed = (performance.now() - blurInStartedAt) / 1000;
        const blurInProgress = Math.min(elapsed / LOOP_BLUR_IN_SECONDS, 1);
        const blurPx = LOOP_MAX_BLUR_PX * (1 - blurInProgress);
        video.style.filter = `blur(${blurPx}px)`;

        if (blurInProgress >= 1) {
          isBlurringIn = false;
          video.style.filter = "blur(0px)";
        }
      } else if (video.duration && Number.isFinite(video.duration)) {
        const loopJumpTime = video.duration - LOOP_END_TRIM_SECONDS;
        const blurOutStartTime = loopJumpTime - LOOP_BLUR_OUT_SECONDS;

        if (video.currentTime >= blurOutStartTime) {
          const blurOutProgress = Math.min(
            (video.currentTime - blurOutStartTime) / LOOP_BLUR_OUT_SECONDS,
            1
          );
          const blurPx = LOOP_MAX_BLUR_PX * blurOutProgress;
          video.style.filter = `blur(${blurPx}px)`;
        } else {
          video.style.filter = "blur(0px)";
        }

        if (video.currentTime >= loopJumpTime) {
          video.style.filter = `blur(${LOOP_MAX_BLUR_PX}px)`;
          video.currentTime = LOOP_RESTART_TIME_SECONDS;
          if (!video.paused) {
            void video.play().catch(() => {});
          }
          isBlurringIn = true;
          blurInStartedAt = performance.now();
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      video.style.filter = "blur(0px)";
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 500ms ease",
      }}
    >
      <video
        ref={videoRef}
        src={sorrySceneAssets.video.background}
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(0px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(0, 0, 0, ${BACKGROUND_VIDEO_DARKNESS})`,
        }}
      />
    </div>
  );
}
