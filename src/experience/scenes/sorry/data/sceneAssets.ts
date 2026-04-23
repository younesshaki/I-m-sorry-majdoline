import centerpieceModelUrl from "../models/baby_yoda_free_3d_by_oscar_creativo.glb?url";
import octopusModelUrl from "../models/octopus_plush.glb?url";
import pancakeModelUrl from "../models/pancake.glb?url";
import roseModelUrl from "../models/piano_rose.glb?url";
import stitchModelUrl from "../models/stitch_lilo__stitch_disney.glb?url";
import backgroundVideoUrl from "../background video/No Copyright, Copyright Free Videos, sunset, beach, sea, waves - motics - Motion Backgrounds (1080p, h264).mp4?url";

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
  },
};

export const chapterModelUrls: string[] = [
  sorrySceneAssets.models.centerpiece,
];
