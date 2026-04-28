import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene8: NarrativeScene = {
  id: "sorry-scene-8",
  title: "Glass",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    { text: "Life was already asking a lot from you." },
    { text: "And I added heaviness when I should have brought peace." },
    { text: "another one of those 100 punches" },
    { text: "I know you keep going even when you are tired." },
    { text: "I know you do not always show how much it takes from you." },
    { text: "I know you carry things quietly", flipWords: {
        target: "quietly",
        words: ["quietly", "without complaint",],
        intervalMs: 1500,
        finalHoldMs: 1500,
      }, },
    { text: "I am sorry I became one more thing you had to survive." },
  ],
};
