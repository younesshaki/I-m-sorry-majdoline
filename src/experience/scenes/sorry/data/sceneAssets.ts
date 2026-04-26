const CDN = "https://spheqdcagzndypxmqvuh.supabase.co/storage/v1/object/public/sorry-media";

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
    blenderScenes: [
      `${CDN}/blenderscene1.mp4`,
      `${CDN}/blenderscene2.mp4`,
      `${CDN}/blenderscene3.mp4`,
      `${CDN}/blenderscene5.mp4`,
      `${CDN}/blenderscenefinal.mp4`,
    ],
  },
};

// Models are not needed until scene 12 — preloaded lazily inside SorryChapter on mount,
// so they don't block the preloader gate.
export const chapterModelUrls: string[] = [];
