# Sorry Chapter Models

Put 3D models used only by the `sorry` chapter in this folder.

Recommended:

- `.glb` files for scene models
- one file per asset
- clear names, for example:
  - `door.glb`
  - `ring.glb`
  - `flower_field.glb`

When you add a model here, wire it through:

- `src/experience/scenes/sorry/data/sceneAssets.ts`
- `src/experience/scenes/sorry/SorryScene.tsx`

Current folder scope:

- only assets related to the `sorry` chapter should live here
