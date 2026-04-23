import type { RefObject } from "react";
import { useCinematicTimeline } from "../shared/useCinematicTimeline";

type SorryTimelineOptions = {
  overlayRef: RefObject<HTMLDivElement>;
  isActive: boolean;
  onAllScenesComplete?: () => void;
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
  });
}
