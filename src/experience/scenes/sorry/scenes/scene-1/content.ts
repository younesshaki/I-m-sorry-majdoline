import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene1: NarrativeScene = {
  id: "sorry-scene-1",
  title: "Sorry",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    {
      text: "I have been carrying this for weeks.",
      flipWords: {
        target: "weeks",
        words: ["weeks", "days", "minutes", "seconds"],
        intervalMs: 1500,
        finalHoldMs: 1500,
      },
    },
    { text: "I know I hurt you with words I can never take back." },
    { text: "I know no amount of regret can undo the damage.", highlights: ["damage"], flipWords: {
        target: "damage",
        words: ["damage", "tears", "heartbreak",],
        intervalMs: 1500,
        finalHoldMs: 1500,
      }, },
    { text: "Not because those words were true." },
    { text: "They were not." },
  ],
};
