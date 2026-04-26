import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene9: NarrativeScene = {
  id: "sorry-scene-9",
  title: "Orbit",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    { text: "I know you don't express much." },
    { text: "That is why I chose to reach you this way." },
    { text: "So I don't pressure you anymore." },
    { text: "Nor make things more difficult than they already are." },
    { text: "I want to take this chance to simply tell you something." },
    { text: "Something that has always been true and will never change.", highlights: ["will never change"] },
  ],
};
