import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene3: NarrativeScene = {
  id: "sorry-scene-3",
  title: "Distance",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    { text: "I know I haven't been easy, most times.", flipWords: {
        target: "easy",
        words: ["easy", "understanding", "loving",],
        intervalMs: 1500,
        finalHoldMs: 1500,
      }, },
    { text: "I know I made things harder than they needed to be." },
    { text: "The love was real, and so was the hurt I caused." },
    { text: "I felt the moment getting worse and still did not stop myself." },
    { text: "That is on me." },
  ],
};
