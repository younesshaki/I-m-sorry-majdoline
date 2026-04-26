import type { NarrativeScene } from "../../../shared/narrativeTypes";

export const scene1: NarrativeScene = {
  id: "sorry-scene-1",
  title: "Sorry",
  behavior: "cinematic",
  duration: 25,
  mode: "3d",
  position: { x: 0, y: 0, align: "center" },
  lines: [
    { text: "I have been carrying this for weeks." },
    { text: "The weight of what I said, and the silence I left after it." },
    { text: "I know no amount of regret can undo the damage." },
    { text: "No amount of anger, pain, or concern gives me the right to hurt you the way I did." },
    { text: "I said something cruel to the person I love most." },
    { text: "And I have not stopped thinking about it since." },
  ],
};
