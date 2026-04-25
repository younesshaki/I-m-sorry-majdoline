import { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SCENE_FONT_FAMILY } from "../shared/sceneTypography";
import "../shared/sceneFonts.css";

export const NO_ENDING_LINES = [
  "I understand.",
  "Thank you for being honest with me.",
  "Take care of yourself.",
];

const NO_ENDING_FADE_OUT_DELAY_MS = 3600;
const NO_ENDING_GO_HOME_DELAY_MS = 5000;

type NoEndingSceneProps = {
  onDone: () => void;
};

type NoEndingOverlayProps = {
  isLeaving: boolean;
};

function NoEndingOverlay({ isLeaving }: NoEndingOverlayProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.72)",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "min(540px, calc(100vw - 3rem))",
          padding: "2rem",
          opacity: isLeaving ? 0 : 1,
          transform: isLeaving ? "translate3d(0, -12px, 0)" : "translate3d(0, 0, 0)",
          transition: "opacity 1000ms ease, transform 1000ms ease",
          animation: "noEndingFadeIn 1000ms ease both",
        }}
      >
        {NO_ENDING_LINES.map((line) => (
          <p
            key={line}
            style={{
              fontFamily: SCENE_FONT_FAMILY,
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.9,
              letterSpacing: "0.03em",
              color: "rgba(245,238,231,0.78)",
              margin: "0 0 0.65rem",
            }}
          >
            {line}
          </p>
        ))}
        <style>
          {`
            @keyframes noEndingFadeIn {
              from {
                opacity: 0;
                transform: translate3d(0, 16px, 0);
              }
              to {
                opacity: 1;
                transform: translate3d(0, 0, 0);
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export function NoEndingScene({ onDone }: NoEndingSceneProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [overlayRoot, setOverlayRoot] = useState<{ host: HTMLDivElement; root: Root } | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const host = document.createElement("div");
    host.dataset.sorryNoEnding = "true";
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "2400";
    host.style.pointerEvents = "auto";
    document.body.appendChild(host);
    const root = createRoot(host);
    setOverlayRoot({ host, root });

    return () => {
      root.unmount();
      host.remove();
    };
  }, []);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setIsLeaving(true), NO_ENDING_FADE_OUT_DELAY_MS);
    const doneTimer = window.setTimeout(onDone, NO_ENDING_GO_HOME_DELAY_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  useEffect(() => {
    if (!overlayRoot) {
      return;
    }

    overlayRoot.root.render(<NoEndingOverlay isLeaving={isLeaving} />);
  }, [isLeaving, overlayRoot]);

  return null;
}
