import { lazy, Suspense } from "react";

const SorryChapter = lazy(() => import("./scenes/sorry"));

interface SceneManagerProps {
  scenesHidden?: boolean;
  onGoHome?: () => void;
  onSorrySceneChange?: (index: number) => void;
  onSorryProgressChange?: (progress: number) => void;
}

export default function SceneManager({
  scenesHidden = false,
  onGoHome,
  onSorrySceneChange,
  onSorryProgressChange,
}: SceneManagerProps) {
  return (
    <group visible={!scenesHidden}>
      <Suspense fallback={null}>
        <SorryChapter
          isActive={!scenesHidden}
          onGoHome={onGoHome}
          onSceneChange={onSorrySceneChange}
          onProgressChange={onSorryProgressChange}
        />
      </Suspense>
    </group>
  );
}
