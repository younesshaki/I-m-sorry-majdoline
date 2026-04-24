/**
 * Shared module-level gate that the Sorry chapter uses to coordinate
 * when the scroll-to-continue indicator may appear.
 *
 * - `SorryLyricsDisplay` sets `paragraphComplete = true` after all lines
 *   of the active scene have finished their exit animation.
 * - `useCinematicTimeline` (via an `advanceGate` option) holds off setting
 *   `debugState.waitingForScroll = true` until this gate is open.
 * - On scene change, both sides call `reset()` so the next paragraph gates
 *   scroll again.
 */
export const sorryScrollGate = {
  paragraphComplete: false,
  reset() {
    this.paragraphComplete = false;
  },
  open() {
    this.paragraphComplete = true;
  },
};
