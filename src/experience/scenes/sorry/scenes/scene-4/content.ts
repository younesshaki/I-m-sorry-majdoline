import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene4: NarrativeScene = {
  id: "sorry-scene-4",
  title: "Ashes",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    { text: "Good intentions do not erase what I did." },
    { text: "Love is not only what I feel." },
    { text: "It is how I treat you." },
    { text: "I have failed.", highlights: ["I", "have", "failed"], },
    { text: "I said those words to the person I love most." },
    { text: "In that moment, I did not treat you with the care you deserved." },
    { text: "I hate that I let anger speak where love should have been." },
  ],
};
