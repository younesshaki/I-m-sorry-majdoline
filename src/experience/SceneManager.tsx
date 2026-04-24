import { lazy, Suspense } from "react";

const SorryChapter = lazy(() => import("./scenes/sorry"));

interface SceneManagerProps {
  scenesHidden?: boolean;
  onGoHome?: () => void;
  onSorrySceneChange?: (index: number) => void;
}

export default function SceneManager({
  scenesHidden = false,
  onGoHome,
  onSorrySceneChange,
}: SceneManagerProps) {
  return (
    <group visible={!scenesHidden}>
      <Suspense fallback={null}>
        <SorryChapter
          isActive={!scenesHidden}
          onGoHome={onGoHome}
          onSceneChange={onSorrySceneChange}
        />
      </Suspense>
    </group>
  );
}
