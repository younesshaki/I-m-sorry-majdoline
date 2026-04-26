import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene4: NarrativeScene = {
  id: "sorry-scene-4",
  title: "Ashes",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    { text: "Deep down, my intention has always been to be nothing but caring." },
    { text: "To show it with my words and with my actions." },
    { text: "I have failed.", highlights: ["I have failed"] },
    { text: "Anger always promises relief and leaves behind ash." },
    { text: "It burns the wrong thing first." },
    { text: "I hate that I let it speak to you." },
  ],
};
