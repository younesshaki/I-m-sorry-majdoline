const CDN = "https://spheqdcagzndypxmqvuh.supabase.co/storage/v1/object/public/sorry-media";

export type SorryVideoQuality = "high" | "normal";

export const sorrySceneAssets = {
  models: {
    centerpiece: `${CDN}/models/baby_yoda_free_3d_by_oscar_creativo.glb`,
    octopus:     `${CDN}/models/octopus_plush.glb`,
    pancake:     `${CDN}/models/pancake.glb`,
    rose:        `${CDN}/models/piano_rose.glb`,
    stitch:      `${CDN}/models/stitch_lilo__stitch_disney.glb`,
  },
  audio: {},
  video: {
    background:   `${CDN}/sunset.mp4`,
    blenderScenes: {
      high: [
        `${CDN}/video/blenderscene1-original-v1.mp4`,
        `${CDN}/video/blenderscene2-original-v1.mp4`,
        `${CDN}/video/blenderscene3-original-v1.mp4`,
        `${CDN}/video/blenderscene5-original-v1.mp4`,
        `${CDN}/video/blenderscenefinal-original-v1.mp4`,
      ],
      normal: [
        `${CDN}/video/blenderscene1-crf22-v1.mp4`,
        `${CDN}/video/blenderscene2-crf22-v1.mp4`,
        `${CDN}/video/blenderscene3-crf22-v1.mp4`,
        `${CDN}/video/blenderscene5-crf22-v1.mp4`,
        `${CDN}/video/blenderscenefinal-crf22-v1.mp4`,
      ],
    } satisfies Record<SorryVideoQuality, string[]>,
  },
};

// Models are not needed until scene 12 — preloaded lazily inside SorryChapter on mount,
// so they don't block the preloader gate.
export const chapterModelUrls: string[] = [];
