import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, Center, OrbitControls, useGLTF } from "@react-three/drei";
import type { Group } from "three";
import { createRoot, type Root } from "react-dom/client";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { SCENE_FONT_FAMILY } from "../shared/sceneTypography";
import { sorrySceneAssets } from "./data/sceneAssets";
import "./ForgivenessScene.css";

type ForgivenessSceneProps = {
  onYes: () => void;
  onNo: () => void;
};

const CAROUSEL_MODELS = [
  { url: sorrySceneAssets.models.pancake, label: "pancake" },
  { url: sorrySceneAssets.models.stitch, label: "stitch" },
  { url: sorrySceneAssets.models.rose,   label: "rose"    },
];

function GltfModel({ url }: { url: string }) {
  const groupRef = useRef<Group>(null);
  const gltf = useGLTF(url);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.28;
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function ModelCarousel() {
  const [index, setIndex] = useState(0);
  const model = CAROUSEL_MODELS[index];

  const prev = () => setIndex(i => (i - 1 + CAROUSEL_MODELS.length) % CAROUSEL_MODELS.length);
  const next = () => setIndex(i => (i + 1) % CAROUSEL_MODELS.length);

  return (
    <div className="forgivenessCarousel">
      <div className="forgivenessCarouselTrack">
        <HoverBorderGradient
          as="button"
          type="button"
          onClick={prev}
          aria-label="Previous gift"
          containerClassName="forgivenessChoiceButton forgivenessArrow"
          className="forgivenessChoiceButton__inner"
        >
          ‹
        </HoverBorderGradient>

        <div className="forgivenessPancakePreview" aria-label={`3D model: ${model.label}`}>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0.7, 4.2], fov: 34 }}
            gl={{ alpha: true, antialias: true, powerPreference: "default" }}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[3, 5, 4]} intensity={2.4} />
            <directionalLight position={[-3, 2, -2]} intensity={0.7} />
            <Suspense key={model.url} fallback={null}>
              <Bounds fit clip observe margin={1.25}>
                <Center>
                  <GltfModel url={model.url} />
                </Center>
              </Bounds>
            </Suspense>
            <OrbitControls
              makeDefault
              autoRotate
              autoRotateSpeed={0.7}
              enableDamping
              dampingFactor={0.08}
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI * 0.18}
              maxPolarAngle={Math.PI * 0.82}
            />
          </Canvas>
        </div>

        <HoverBorderGradient
          as="button"
          type="button"
          onClick={next}
          aria-label="Next gift"
          containerClassName="forgivenessChoiceButton forgivenessArrow"
          className="forgivenessChoiceButton__inner"
        >
          ›
        </HoverBorderGradient>
      </div>

      <p className="forgivenessRewardText">
        see the rewards for forgiving this sorry man
      </p>
    </div>
  );
}

function ForgivenessOverlay({ onYes, onNo }: ForgivenessSceneProps) {
  return (
    <div
      className="forgivenessOverlay"
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
      {/* Centered question + buttons */}
      <div className="forgivenessStage">
        <div
          className="forgivenessCopy"
          style={{
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
        </div>
      </div>

      {/* Corner carousel */}
      <div className="forgivenessCarouselCorner">
        <ModelCarousel />
      </div>

      <style>
        {`
          @keyframes forgivenessFadeIn {
            from { opacity: 0; transform: translate3d(0, 20px, 0); }
            to   { opacity: 1; transform: translate3d(0, 0, 0); }
          }
        `}
      </style>
    </div>
  );
}

CAROUSEL_MODELS.forEach(m => useGLTF.preload(m.url));

export function ForgivenessScene({ onYes, onNo }: ForgivenessSceneProps) {
  const [overlayRoot, setOverlayRoot] = useState<{ host: HTMLDivElement; root: Root } | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

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
    if (!overlayRoot) return;
    overlayRoot.root.render(<ForgivenessOverlay onYes={onYes} onNo={onNo} />);
  }, [onNo, onYes, overlayRoot]);

  return null;
}
