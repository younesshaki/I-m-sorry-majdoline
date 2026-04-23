import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useDisposableGLTF } from "../../../hooks/useDisposableGLTF";
import { sorrySceneAssets } from "./data/sceneAssets";
import { SORRY_AUTO_ROTATE_SPEED } from "./cameraConfig";

const DRACO_DECODER_PATH = "/draco/";
const ENTRY_DURATION = 2.8;
const LIGHT_LERP_SPEED = 1.0;
const GROUP_LERP_SPEED = 0.7;

// Four screen corners models can enter from
const ENTRY_CORNERS: [number, number, number][] = [
  [-5.5,  3.5, 0],
  [ 5.5,  3.5, 0],
  [-5.5, -3.5, 0],
  [ 5.5, -3.5, 0],
];

type SorrySceneProps = {
  isActive?: boolean;
  activeSceneId?: string | null;
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
};

type ModelDefinition = {
  key: string;
  url: string;
  targetHeight: number;
  yOffset?: number;
  selfRotationSpeed?: number;
  initialRotationY?: number;
  initialEntryOffset: [number, number, number];
  groupOffset: [number, number, number];
  lightLeft: THREE.Color;
  lightRight: THREE.Color;
  lightIntensity: number;
  sceneStart: number;
  sceneEnd: number;
};

const MODEL_SEQUENCE: ModelDefinition[] = [
  {
    key: "yoda",
    url: sorrySceneAssets.models.centerpiece,
    targetHeight: 2.45,
    selfRotationSpeed: 0.12,
    initialRotationY: Math.PI,
    initialEntryOffset: [0, -4.5, 0],
    groupOffset: [0, -2.85, -1.25],
    lightLeft: new THREE.Color("#2d6bff"),
    lightRight: new THREE.Color("#c12d45"),
    lightIntensity: 86.4,
    sceneStart: 1,
    sceneEnd: 2,
  },
  {
    key: "stitch",
    url: sorrySceneAssets.models.stitch,
    targetHeight: 2.45,
    selfRotationSpeed: 0.12,
    initialEntryOffset: [-4.2, 0, 0],
    groupOffset: [0, -2.5, -1.0],
    lightLeft: new THREE.Color("#d946ef"),
    lightRight: new THREE.Color("#7c3aed"),
    lightIntensity: 75,
    sceneStart: 3,
    sceneEnd: 4,
  },
  {
    key: "octopus",
    url: sorrySceneAssets.models.octopus,
    targetHeight: 1.45,
    yOffset: 1,
    selfRotationSpeed: 0.10,
    initialEntryOffset: [4.2, 0, 0],
    groupOffset: [0, -2.2, -1.8],
    lightLeft: new THREE.Color("#0d1f4a"),
    lightRight: new THREE.Color("#0a3352"),
    lightIntensity: 18,
    sceneStart: 5,
    sceneEnd: 6,
  },
  {
    key: "rose",
    url: sorrySceneAssets.models.rose,
    targetHeight: 2.45,
    selfRotationSpeed: 0.08,
    initialEntryOffset: [-4.2, 0, 0],
    groupOffset: [0, -2.9, -0.7],
    lightLeft: new THREE.Color("#9f1239"),
    lightRight: new THREE.Color("#7c2d12"),
    lightIntensity: 95,
    sceneStart: 7,
    sceneEnd: 8,
  },
  {
    key: "pancake",
    url: sorrySceneAssets.models.pancake,
    targetHeight: 2.45,
    yOffset: 0.7,
    selfRotationSpeed: 0.12,
    initialEntryOffset: [4.2, 0, 0],
    groupOffset: [0, -2.6, -1.1],
    lightLeft: new THREE.Color("#d97706"),
    lightRight: new THREE.Color("#b45309"),
    lightIntensity: 80,
    sceneStart: 9,
    sceneEnd: 10,
  },
];

function collectMaterials(root: THREE.Object3D) {
  const materials: THREE.Material[] = [];
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((m) => { if (m && !materials.includes(m)) materials.push(m); });
  });
  return materials;
}

function normalizeMesh(root: THREE.Object3D, targetHeight: number, yOffset = 0) {
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  root.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (size.y > 0) root.scale.setScalar(targetHeight / size.y);

  const scaled = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  scaled.getCenter(center);
  root.position.set(-center.x, -scaled.min.y + yOffset, -center.z);
  root.updateMatrixWorld(true);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function getSceneNumber(id?: string | null) {
  const n = id ? Number.parseInt(id.replace("sorry-scene-", ""), 10) : 1;
  return Number.isFinite(n) ? n : 1;
}

function getModelForScene(n: number) {
  return MODEL_SEQUENCE.find((m) => n >= m.sceneStart && n <= m.sceneEnd) ?? MODEL_SEQUENCE[0];
}

function pickCorner(excludeIndex: number): { offset: [number, number, number]; index: number } {
  const available = ENTRY_CORNERS.map((_, i) => i).filter((i) => i !== excludeIndex);
  const idx = available[Math.floor(Math.random() * available.length)];
  return { offset: ENTRY_CORNERS[idx], index: idx };
}

/* ─── Single model renderer with directional entry ─── */

type ModelProps = {
  model: ModelDefinition;
  entryOffset: [number, number, number];
  onMaterialsReady: (mats: THREE.Material[]) => void;
  isActive: boolean;
};

function ModelRenderer({ model, entryOffset, onMaterialsReady, isActive }: ModelProps) {
  const { scene } = useDisposableGLTF(model.url, DRACO_DECODER_PATH);
  const selfRotRef = useRef<THREE.Group>(null);
  const entryGroupRef = useRef<THREE.Group>(null);
  const entryProgress = useRef(0);

  useLayoutEffect(() => {
    normalizeMesh(scene, model.targetHeight, model.yOffset ?? 0);
    if (selfRotRef.current) {
      selfRotRef.current.rotation.y = model.initialRotationY ?? 0;
    }
    if (entryGroupRef.current) {
      entryGroupRef.current.position.set(...entryOffset);
    }
    entryProgress.current = 0;
  }, [model, scene, entryOffset]);

  const materials = useMemo(() => collectMaterials(scene), [scene]);

  useLayoutEffect(() => {
    materials.forEach((m) => {
      m.transparent = true;
      m.depthWrite = true;
      m.opacity = 1;
      m.visible = true;
      m.needsUpdate = true;
    });
    onMaterialsReady(materials);
  }, [materials, onMaterialsReady]);

  useFrame((_, delta) => {
    if (!isActive) return;

    if (model.selfRotationSpeed && selfRotRef.current) {
      selfRotRef.current.rotation.y += delta * model.selfRotationSpeed;
    }

    if (entryProgress.current < 1 && entryGroupRef.current) {
      entryProgress.current = Math.min(1, entryProgress.current + delta / ENTRY_DURATION);
      const t = easeOutCubic(entryProgress.current);
      entryGroupRef.current.position.set(
        entryOffset[0] * (1 - t),
        entryOffset[1] * (1 - t),
        entryOffset[2] * (1 - t),
      );
    }
  });

  return (
    <group ref={entryGroupRef}>
      <group ref={selfRotRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

/* ─── Main scene ─── */

export function SorryScene({
  isActive = true,
  activeSceneId,
  onTransitionStart,
  onTransitionEnd,
}: SorrySceneProps) {
  const sceneNumber = getSceneNumber(activeSceneId);
  const desiredModel = useMemo(() => getModelForScene(sceneNumber), [sceneNumber]);
  const [currentModel, setCurrentModel] = useState<ModelDefinition>(desiredModel);
  const [activeEntryOffset, setActiveEntryOffset] = useState<[number, number, number]>(
    desiredModel.initialEntryOffset,
  );
  const currentModelRef = useRef(currentModel);
  const isTransitioningRef = useRef(false);

  // Random corner tracking — -1 means no previous corner
  const lastCornerIndexRef = useRef<number>(-1);

  // Refs for Three.js objects mutated directly in useFrame (no re-renders)
  const lightRigRef = useRef<THREE.Group>(null);
  const leftLightRef = useRef<THREE.PointLight>(null);
  const rightLightRef = useRef<THREE.PointLight>(null);
  const sceneGroupRef = useRef<THREE.Group>(null);
  const floatTimeRef = useRef(0);
  const blackoutMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Active model materials — updated via onMaterialsReady callback
  const activeMaterialsRef = useRef<THREE.Material[]>([]);
  // Set true just before model swap; ModelRenderer clears it via onMaterialsReady
  const awaitingNewMatsRef = useRef(false);
  // Phase-2 GSAP callback stored until new materials arrive
  const phase2Ref = useRef<(() => void) | null>(null);

  // Light color lerp state
  const lightTarget = useRef({
    left: desiredModel.lightLeft.clone(),
    right: desiredModel.lightRight.clone(),
    intensity: desiredModel.lightIntensity,
  });
  const lightCurrent = useRef({
    left: desiredModel.lightLeft.clone(),
    right: desiredModel.lightRight.clone(),
    intensity: desiredModel.lightIntensity,
  });

  // Group position lerp
  const groupTarget = useRef(new THREE.Vector3(...desiredModel.groupOffset));
  const groupCurrent = useRef(new THREE.Vector3(...desiredModel.groupOffset));

  const handleMaterialsReady = useCallback((mats: THREE.Material[]) => {
    activeMaterialsRef.current = mats;

    if (awaitingNewMatsRef.current) {
      awaitingNewMatsRef.current = false;
      // Start new model fully transparent so it fades in with the lifting blackout
      mats.forEach((m) => { m.transparent = true; m.opacity = 0; m.needsUpdate = true; });
      phase2Ref.current?.();
      phase2Ref.current = null;
    }
  }, []);

  useEffect(() => {
    currentModelRef.current = currentModel;
  }, [currentModel]);

  // Model transition with simultaneous model fade-out + blackout
  useEffect(() => {
    if (desiredModel.key === currentModelRef.current.key) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    onTransitionStart?.();

    const outgoingMats = [...activeMaterialsRef.current];
    outgoingMats.forEach((m) => { m.transparent = true; m.needsUpdate = true; });

    const blackoutProxy = { opacity: 0 };
    const fadeOutProxy = { opacity: 1 };

    // Phase 1 — fade out old model + fade to black simultaneously
    gsap.to(blackoutProxy, {
      opacity: 1,
      duration: 0.38,
      ease: "power2.in",
      onUpdate: () => {
        if (blackoutMatRef.current) blackoutMatRef.current.opacity = blackoutProxy.opacity;
      },
      onComplete: () => {
        // Pick a random corner (not the last used)
        const { offset: nextEntry, index: nextCornerIdx } = pickCorner(lastCornerIndexRef.current);
        lastCornerIndexRef.current = nextCornerIdx;

        // Update light and group targets
        lightTarget.current.left.copy(desiredModel.lightLeft);
        lightTarget.current.right.copy(desiredModel.lightRight);
        lightTarget.current.intensity = desiredModel.lightIntensity;
        groupTarget.current.set(...desiredModel.groupOffset);

        // Phase 2 runs once new model's materials are ready
        phase2Ref.current = () => {
          const newMats = activeMaterialsRef.current;
          const fadeInProxy = { opacity: 0 };

          gsap.to(blackoutProxy, {
            opacity: 0,
            duration: 0.7,
            delay: 0.04,
            ease: "power2.out",
            onUpdate: () => {
              if (blackoutMatRef.current) blackoutMatRef.current.opacity = blackoutProxy.opacity;
            },
            onComplete: () => {
              isTransitioningRef.current = false;
              onTransitionEnd?.();
            },
          });

          gsap.to(fadeInProxy, {
            opacity: 1,
            duration: 0.7,
            delay: 0.04,
            ease: "power2.out",
            onUpdate: () => {
              newMats.forEach((m) => { m.opacity = fadeInProxy.opacity; m.needsUpdate = true; });
            },
            onComplete: () => {
              newMats.forEach((m) => { m.transparent = false; m.opacity = 1; m.needsUpdate = true; });
            },
          });
        };

        // Swap model — triggers ModelRenderer remount → handleMaterialsReady fires phase 2
        awaitingNewMatsRef.current = true;
        currentModelRef.current = desiredModel;
        setCurrentModel(desiredModel);
        setActiveEntryOffset(nextEntry);
      },
    });

    gsap.to(fadeOutProxy, {
      opacity: 0,
      duration: 0.38,
      ease: "power2.in",
      onUpdate: () => {
        outgoingMats.forEach((m) => { m.opacity = fadeOutProxy.opacity; m.needsUpdate = true; });
      },
    });
  }, [desiredModel, onTransitionStart, onTransitionEnd]);

  useFrame((_, delta) => {
    if (!isActive) return;

    if (lightRigRef.current) {
      lightRigRef.current.rotation.y -= delta * SORRY_AUTO_ROTATE_SPEED;
    }

    if (leftLightRef.current && rightLightRef.current) {
      const s = 1 - Math.exp(-delta * LIGHT_LERP_SPEED);
      lightCurrent.current.left.lerp(lightTarget.current.left, s);
      lightCurrent.current.right.lerp(lightTarget.current.right, s);
      lightCurrent.current.intensity +=
        (lightTarget.current.intensity - lightCurrent.current.intensity) * s;

      leftLightRef.current.color.copy(lightCurrent.current.left);
      rightLightRef.current.color.copy(lightCurrent.current.right);
      leftLightRef.current.intensity = lightCurrent.current.intensity;
      rightLightRef.current.intensity = lightCurrent.current.intensity;
    }

    if (sceneGroupRef.current) {
      const sg = 1 - Math.exp(-delta * GROUP_LERP_SPEED);
      groupCurrent.current.lerp(groupTarget.current, sg);
      floatTimeRef.current += delta * 0.65;
      const floatY = Math.sin(floatTimeRef.current) * 0.06;
      sceneGroupRef.current.position.set(
        groupCurrent.current.x,
        groupCurrent.current.y + floatY,
        groupCurrent.current.z,
      );
    }
  });

  return (
    <>
      <fog attach="fog" args={["#040405", 6, 18]} />
      <ambientLight intensity={isActive ? 0.2 : 0.08} />
      <directionalLight position={[0, 2, 3]} intensity={0.35} color="#d4b7aa" />

      <group ref={lightRigRef}>
        <pointLight
          ref={leftLightRef}
          position={[-3.6, 0.5, 2.2]}
          intensity={currentModel.lightIntensity}
          distance={10}
          color={currentModel.lightLeft}
        />
        <pointLight
          ref={rightLightRef}
          position={[3.6, 0.3, 2.2]}
          intensity={currentModel.lightIntensity}
          distance={10}
          color={currentModel.lightRight}
        />
      </group>

      <group ref={sceneGroupRef} rotation={[-0.14, 0.55, 0]}>
        <ModelRenderer
          key={`model-${currentModel.key}`}
          model={currentModel}
          entryOffset={activeEntryOffset}
          onMaterialsReady={handleMaterialsReady}
          isActive={isActive}
        />
      </group>

      <Sparkles count={20} size={2.2} scale={[5, 3, 4]} speed={0.25} color="#c48d7e" />

      {/* Full-viewport blackout plane — covers scene during model transitions */}
      <mesh position={[0, 0, 4.9]} renderOrder={9999}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          ref={blackoutMatRef}
          color="#000000"
          transparent
          opacity={0}
          depthTest={false}
        />
      </mesh>
    </>
  );
}
