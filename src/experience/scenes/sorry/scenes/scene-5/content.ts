import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene5: NarrativeScene = {
  id: "sorry-scene-5",
  title: "Night Drive",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    { text: "I broke your heart." },
    { text: "Even if you did not show the pain right away, I know it was there.", blankBeforeMs: 5000 },
    { text: "I remember your painting and what It meant." },
    { text: "Like a whole sky pressed behind a closed Door." },
    { text: "So much pain looking for a way out." },
    { text: "You deserved patience before frustration." },
    { text: "You deserved softness before defense." },
    { text: "I am sorry I made love feel heavy when it should have felt safe." },
  ],
};
