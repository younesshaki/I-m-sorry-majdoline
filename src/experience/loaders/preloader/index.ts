import type { LoaderAudio } from "../shared/types";
import { Loader } from "./Loader";

const preloaderLoopUrl = "https://spheqdcagzndypxmqvuh.supabase.co/storage/v1/object/public/sorry-media/enhypen-fatal-trouble.mp3";

export const loaderAudio: LoaderAudio = {
  loop: preloaderLoopUrl,
  volume: 0.7,
  fadeInMs: 1800,
  fadeOutMs: 1800,
};

export { Loader };
