import type { RefObject } from "react";
import { NarrativeOverlay } from "../shared/NarrativeOverlay";
import { sorryScenes } from "./data";
import "./Sorry.css";

type SorryNarrativeProps = {
  isActive: boolean;
  overlayRef: RefObject<HTMLDivElement>;
};

export function SorryNarrative({
  isActive,
  overlayRef,
}: SorryNarrativeProps) {
  return (
    <NarrativeOverlay
      isActive={isActive}
      overlayRef={overlayRef}
      scenes={sorryScenes}
      overlayClassName="sorryOverlay"
      sceneClassName="sorryScene"
      titleClassName="sorryTitle"
      lineClassName="sorryLine"
    />
  );
}
