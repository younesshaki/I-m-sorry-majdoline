import type { LoaderAudio } from "../shared/types";
import { Loader } from "./Loader";

const loopUrl = "https://spheqdcagzndypxmqvuh.supabase.co/storage/v1/object/public/sorry-media/here-comes-the-sun-loaderA.mp3";

export const loaderAudio: LoaderAudio | null = {
  loop: loopUrl,
  volume: 0.5, // Default volume, can be adjusted
};

export { Loader };
