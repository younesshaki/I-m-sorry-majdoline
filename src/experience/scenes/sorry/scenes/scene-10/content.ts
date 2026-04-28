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
        words: ["miss", "love", "respect"],
        intervalMs: 1500,
        finalHoldMs: 1500,
      }, },
    { text: "The way you made ordinary days feel full." },
    { text: "You brought life into places I did not know were empty." },
    { text: "I pray life becomes gentler with you." },
    { text: "I pray you get peace without having to fight for it." },
    { text: "And I pray I never forget what your patience deserved from me." },
  ],
};
