import { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";

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
            fontFamily: 'Georgia, "Times New Roman", serif',
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
          <button
            type="button"
            onClick={onYes}
            style={{
              padding: "0.85rem 2.4rem",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.07)",
              color: "rgba(245,238,231,0.9)",
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.28s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.14)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.38)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
            }}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={onNo}
            style={{
              padding: "0.85rem 2.4rem",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "999px",
              background: "transparent",
              color: "rgba(245,238,231,0.45)",
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.28s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(245,238,231,0.7)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(245,238,231,0.45)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            }}
          >
            No
          </button>
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
