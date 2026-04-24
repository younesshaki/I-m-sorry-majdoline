import type { LoaderAudio } from "../shared/types";
import { Loader } from "./Loader";
import preloaderLoopUrl from "/Users/younesshaki/Documents/I-m-sorry-majdoline/src/experience/scenes/sorry/audio/ENHYPEN Fatal Trouble Lyrics (엔하이픈 Fatal Trouble 가사) [Color Coded Han_Rom_Eng]  ShadowByYoongi.mp3";

export const loaderAudio: LoaderAudio = {
  loop: preloaderLoopUrl,
  volume: 0.7,
  fadeInMs: 1800,
  fadeOutMs: 1800,
};

export { Loader };
