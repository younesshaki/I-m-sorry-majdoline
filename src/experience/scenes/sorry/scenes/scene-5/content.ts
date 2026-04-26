import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene5: NarrativeScene = {
  id: "sorry-scene-5",
  title: "Night Drive",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    { text: "Trust does not always break like thunder." },
    { text: "Sometimes it cracks like glass: quiet, sharp, almost invisible." },
    { text: "I have failed to protect you." },
    { text: "I have failed to protect the only person who means everything to me.", highlights: ["everything to me"] },
    { text: "I failed to reward your patience." },
    { text: "I should have been your wall." },
  ],
};
