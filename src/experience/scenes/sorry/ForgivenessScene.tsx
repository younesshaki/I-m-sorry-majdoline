import { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { SCENE_FONT_FAMILY } from "../shared/sceneTypography";
import "./ForgivenessScene.css";

type ForgivenessSceneProps = {
  onYes: () => void;
  onNo: () => void;
};

function ForgivenessOverlay({ onYes, onNo }: ForgivenessSceneProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "min(540px, calc(100vw - 3rem))",
          padding: "2.5rem 2rem",
          opacity: 1,
          transform: "translate3d(0, 0, 0)",
          animation: "forgivenessFadeIn 1200ms ease 120ms both",
        }}
      >
        <p
          style={{
            fontFamily: SCENE_FONT_FAMILY,
            fontSize: "clamp(1rem, 2.2vw, 1.25rem)",
            lineHeight: 1.85,
            letterSpacing: "0.03em",
            color: "rgba(245,238,231,0.82)",
            margin: "0 0 2.8rem",
          }}
        >
          Do you have it in you to forgive me?
        </p>
        <div style={{ display: "flex", gap: "1.2rem", justifyContent: "center" }}>
          <HoverBorderGradient
            as="button"
            type="button"
            onClick={onYes}
            containerClassName="forgivenessChoiceButton forgivenessChoiceButton--yes"
            className="forgivenessChoiceButton__inner"
          >
            Yes
          </HoverBorderGradient>
          <HoverBorderGradient
            as="button"
            type="button"
            onClick={onNo}
            containerClassName="forgivenessChoiceButton forgivenessChoiceButton--no"
            className="forgivenessChoiceButton__inner"
          >
            No
          </HoverBorderGradient>
        </div>
        <style>
          {`
            @keyframes forgivenessFadeIn {
              from {
                opacity: 0;
                transform: translate3d(0, 20px, 0);
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

export function ForgivenessScene({ onYes, onNo }: ForgivenessSceneProps) {
  const [overlayRoot, setOverlayRoot] = useState<{ host: HTMLDivElement; root: Root } | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const host = document.createElement("div");
    host.dataset.sorryForgiveness = "true";
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
    if (!overlayRoot) {
      return;
    }

    overlayRoot.root.render(<ForgivenessOverlay onYes={onYes} onNo={onNo} />);
  }, [onNo, onYes, overlayRoot]);

  return null;
}
