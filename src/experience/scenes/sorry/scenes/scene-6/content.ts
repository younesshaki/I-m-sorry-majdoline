import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene6: NarrativeScene = {
  id: "sorry-scene-6",
  title: "Silence",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    { text: "I know trust can change quietly." },
    { text: "Sometimes it cracks like glass... quiet.", flipWords: {
        target: "quiet",
        words: ["quiet", "sharp", "invisible",],
        intervalMs: 1700,
        finalHoldMs: 1500,
      }, },
    { text: "I should have been more careful with your heart." },
    { text: "I should have protected the person who means everything to me.", },
    { text: "I failed to reward your patience.", flipWords: {
        target: "patience",
        words: ["patience", "sacrifice", "efforts",],
        intervalMs: 1500,
        finalHoldMs: 1500,
      }, },
    { text: "I should have made love feel safe." },
  ],
};
