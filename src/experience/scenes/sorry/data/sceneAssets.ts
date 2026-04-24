import centerpieceModelUrl from "../models/baby_yoda_free_3d_by_oscar_creativo.glb?url";
import octopusModelUrl from "../models/octopus_plush.glb?url";
import pancakeModelUrl from "../models/pancake.glb?url";
import roseModelUrl from "../models/piano_rose.glb?url";
import stitchModelUrl from "../models/stitch_lilo__stitch_disney.glb?url";
import backgroundVideoUrl from "../background video/No Copyright, Copyright Free Videos, sunset, beach, sea, waves - motics - Motion Backgrounds (1080p, h264).mp4?url";
import blenderScene1Url from "../background video/blenderscene1.mp4?url";
import blenderScene2Url from "../background video/blenderscene2.mp4?url";
import blenderScene3Url from "../background video/blenderscene3.mp4?url";
import blenderScene5Url from "../background video/blenderscene5.mp4?url";
import blenderSceneFinalUrl from "../background video/blenderscenefinal.mp4?url";

export const sorrySceneAssets = {
  models: {
    centerpiece: centerpieceModelUrl,
    octopus: octopusModelUrl,
    pancake: pancakeModelUrl,
    rose: roseModelUrl,
    stitch: stitchModelUrl,
  },
  audio: {},
  video: {
    background: backgroundVideoUrl,
    blenderScenes: [blenderScene1Url, blenderScene2Url, blenderScene3Url, blenderScene5Url, blenderSceneFinalUrl],
  },
};

export const chapterModelUrls: string[] = [
  sorrySceneAssets.models.centerpiece,
];
