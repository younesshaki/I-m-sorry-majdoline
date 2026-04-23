import { useCallback, useRef, useState } from "react";
import { SorryScene } from "./SorryScene";
import { SorryNarrative } from "./SorryNarrative";
import { useSorryTimeline } from "./SorryTimeline";
import { useAmbientMusic } from "./useAmbientMusic";
import { sorryMusicUrl } from "./audio";
import { useActiveNarrativeScene } from "../shared/useActiveNarrativeScene";
import { sorryScenes } from "./data";
import { ForgivenessScene } from "./ForgivenessScene";
import { Scene12 } from "./Scene12";
import { NoEndingScene } from "./NoEndingScene";
import { useStory } from "../../story/StoryProvider";

type SorryPhase = "cinematic" | "forgiveness" | "scene12" | "ending";

type SorryChapterProps = {
  isActive?: boolean;
  onGoHome?: () => void;
};

export default function SorryChapter({ isActive = true, onGoHome }: SorryChapterProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeScene = useActiveNarrativeScene(overlayRef, sorryScenes, isActive);
  const [phase, setPhase] = useState<SorryPhase>("cinematic");
  const { unlockFlag } = useStory();

  useAmbientMusic({
    musicUrl: sorryMusicUrl,
    isActive,
    baseVolume: 0.2,
    duckedVolume: 0.06,
    fadeInDuration: 3,
    fadeOutDuration: 2,
    startDelay: 0.5,
  });

  const handleAllScenesComplete = useCallback(() => {
    setPhase("forgiveness");
  }, []);

  useSorryTimeline({
    overlayRef,
    isActive: isActive && phase === "cinematic",
    onAllScenesComplete: handleAllScenesComplete,
  });

  const handleYes = useCallback(async () => {
    await unlockFlag("gift_unlocked", "sorry-scene-11");
    setPhase("scene12");
  }, [unlockFlag]);

  const handleNo = useCallback(() => {
    setPhase("ending");
  }, []);

  const handleScene12Complete = useCallback(() => {
    onGoHome?.();
  }, [onGoHome]);

  const handleEndingDone = useCallback(() => {
    onGoHome?.();
  }, [onGoHome]);

  return (
    <>
      <SorryScene isActive={isActive} activeSceneId={activeScene.id} />
      {phase === "cinematic" && (
        <SorryNarrative isActive={isActive} overlayRef={overlayRef} />
      )}
      {phase === "forgiveness" && (
        <ForgivenessScene onYes={handleYes} onNo={handleNo} />
      )}
      {phase === "scene12" && (
        <Scene12 onComplete={handleScene12Complete} />
      )}
      {phase === "ending" && (
        <NoEndingScene onDone={handleEndingDone} />
      )}
    </>
  );
}
