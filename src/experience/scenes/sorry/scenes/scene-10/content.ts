import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene10: NarrativeScene = {
  id: "sorry-scene-10",
  title: "After",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    { text: "I miss you more than life.", flipWords: {
        target: "miss",
        words: ["miss", "love", "care about", "respect"],
        intervalMs: 1500,
        finalHoldMs: 1500,
      }, },
    { text: "I pray you get the ease, the peace, the happiness and safety you deserve." },
    { text: "I pray that you don't suffer anymore." },
    { text: "That life becomes easy for you." },
    { text: "That your soul and mind finally get the chance to rest." },
  ],
};
