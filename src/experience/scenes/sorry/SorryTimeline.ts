import type { RefObject } from "react";
import { useCinematicTimeline } from "../shared/useCinematicTimeline";
import { sorryScrollGate } from "./sorryScrollGate";

type SorryTimelineOptions = {
  overlayRef: RefObject<HTMLDivElement>;
  isActive: boolean;
  onAllScenesComplete?: () => void;
};

const sorryAdvanceGate = {
  isOpen: () => sorryScrollGate.paragraphComplete,
  reset: () => sorryScrollGate.reset(),
};

export function useSorryTimeline({
  overlayRef,
  isActive,
  onAllScenesComplete,
}: SorryTimelineOptions) {
  useCinematicTimeline({
    overlayRef,
    isActive,
    sceneDuration: 25,
    introDelay: 3,
    onAllScenesComplete,
    advanceGate: sorryAdvanceGate,
  });
}
