import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene11: NarrativeScene = {
  id: "sorry-scene-11",
  title: "",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    {
      text: "I am sorry, Majdoline.",
      highlights: ["Majdoline"],
      flipWords: {
        target: "Majdoline",
        words: ["Majdoline", "Dounia", "Warrior", "My blessing"],
        intervalMs: 1500,
        finalHoldMs: 1500,
      },
    },
  ],
};
