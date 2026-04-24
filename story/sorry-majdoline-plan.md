# Sorry Majdoline — Implementation Plan

## New User Flow
```
Gate (preload) → Home (1 card: "Sorry") → Title Card (video bg + Play) → 3D Experience
```

---

## Phase 1 — Add "Sorry" to the Manifest

**File:** `src/experience/story/manifest.ts`

Append a new part at the **end** of `storyManifest` (safest — avoids shifting existing part indices):

```ts
{
  id: "sorry",
  title: "Sorry",
  chapters: [
    chapter("sorry-chapter-1", "Sorry", "cinematic", [
      cinematicScene("sorry-scene-1", "Sorry"),
    ]),
  ],
}
```

This becomes `partIndex: 6, chapterIndex: 0` in the zero-based index system.

---

## Phase 2 — Hide Existing Chapters in the Home UI

**File:** `src/experience/ui/StoryHomePage.tsx`

- Add a constant near the top of the file:
  ```ts
  const VISIBLE_CHAPTER_IDS = ["sorry-chapter-1"];
  ```
- Wrap the `PartGroup` render loop to only show chapters whose id is in `VISIBLE_CHAPTER_IDS`
- Parts with zero visible chapters are not rendered
- Strip the part title label so it doesn't display "Part 7 — Sorry" — just show the card standalone, centered
- **To re-enable any chapter later:** add its id to `VISIBLE_CHAPTER_IDS`. No structural changes needed.

---

## Phase 3 — Add "Title Card" Screen State

**File:** `src/App.tsx`

Add a new screen to the state machine:
```ts
type AppScreen = "gate" | "home" | "titlecard" | "experience";
```

- Home → click "Sorry" card → sets screen to `"titlecard"` (stores partIndex: 6, chapterIndex: 0)
- Title card → click Play → GSAP fade out → sets screen to `"experience"`

Existing `"experience"` screen and all its wiring stays completely untouched.

---

## Phase 4 — Build the Title Card Component

**New file:** `src/experience/ui/SorryTitleCard.tsx`

Contents:
- Full-screen `<video>` element — autoplay, muted, loop — video file placed in `public/`
- Semi-transparent dark overlay for readability
- Minimal centered text (Arabic or French — your call — or just silence)
- A Play button (or pulsing circle) in the center-bottom
- GSAP fade-in on mount
- GSAP fade-out on Play click → then trigger transition to `"experience"`

Video file goes in `public/sorry-bg.mp4` (or whatever you name it). Point `<video src>` to `/sorry-bg.mp4`.

---

## Phase 5 — Wire SceneManager

**File:** `src/experience/SceneManager.tsx`

Add a case for the sorry scene alongside existing part/chapter cases:
```ts
if (partIndex === 6 && chapterIndex === 0) return import("./scenes/sorry")
```

---

## Phase 6 — Replicate Part 1 Chapter 1 Architecture for "Sorry"

This is the most important phase. The sorry scene will mirror the exact architecture of `src/experience/scenes/part1/chapter1/` and then the content will be swapped out.

### New folder: `src/experience/scenes/sorry/`

Mirror this file-for-file from `part1/chapter1/`:

| Original (part1/chapter1) | New (sorry) | Notes |
|---|---|---|
| `index.tsx` | `index.tsx` | Entry point — swap Chapter1 refs to Sorry refs |
| `Chapter1Scene.tsx` | `SorryScene.tsx` | R3F canvas content — start empty/dark |
| `Chapter1Narrative.tsx` | `SorryNarrative.tsx` | Overlay narration/subtitles — replace with sorry content |
| `Chapter1Timeline.ts` | `SorryTimeline.ts` | GSAP timeline — replace scene sequence |
| `Chapter1.css` | `Sorry.css` | Styles — copy as-is, rename references |
| `audioSync.ts` | `audioSync.ts` | Copy as-is initially |
| `cameraConfig.ts` | `cameraConfig.ts` | Copy as-is, adjust later |
| `cueDatabase.ts` | `cueDatabase.ts` | Replace cues with sorry content cues |
| `data.ts` | `data.ts` | Replace scene data |
| `useAmbientMusic.ts` | `useAmbientMusic.ts` | Copy as-is — swap music file reference |
| `audio/` | `audio/` | Empty folder initially — drop sorry music here |
| `models/` | `models/` | Empty folder initially — drop sorry .glb files here |
| `scenes/` | `scenes/` | Replace sub-scenes with sorry scenes |
| `hooks/` | `hooks/` | Copy as-is |
| `data/` | `data/` | Replace with sorry data |

### `index.tsx` wired like chapter 1:
```tsx
export default function SorryChapter({ isActive = true }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useAmbientMusic({
    musicUrl: sorryMusicUrl,
    isActive,
    baseVolume: 0.20,
    duckedVolume: 0.06,
    fadeInDuration: 3,
    fadeOutDuration: 2,
    startDelay: 0.5,
  });

  useCinematicTimeline({
    overlayRef,
    isActive,
    sceneDuration: 25,
    introDelay: 3,
  });

  return <SorryNarrative isActive={isActive} overlayRef={overlayRef} />;
}
```

The first version of the sorry scene will be **a dark/empty canvas with placeholder text** — just enough to confirm the pipeline works end to end. Visual content comes after.

---

## Phase 7 — Hide ChapterNav During "Sorry"

**File:** `src/experience/ui/ChapterNav.tsx`

Add one condition: if the active chapter id is `"sorry-chapter-1"`, return null and don't render the nav. Keeps it invisible to Dounia. Can be removed later during development if needed.

---

## Files Touched Summary

| File | Type | Change |
|---|---|---|
| `src/experience/story/manifest.ts` | Modify | Append sorry part + chapter |
| `src/experience/ui/StoryHomePage.tsx` | Modify | Filter to VISIBLE_CHAPTER_IDS only |
| `src/App.tsx` | Modify | Add "titlecard" screen state |
| `src/experience/SceneManager.tsx` | Modify | Add case for sorry scene |
| `src/experience/ui/ChapterNav.tsx` | Modify | Hide nav when in sorry chapter |
| `src/experience/ui/SorryTitleCard.tsx` | **New** | Video bg + Play button screen |
| `src/experience/scenes/sorry/` | **New folder** | Full mirror of part1/chapter1 architecture |

**Zero existing scene files are touched. Zero chapters are deleted. All 6 parts remain intact in the manifest.**

---

## Build Order (Recommended)

1. Manifest → SceneManager case → empty sorry scene (confirm pipeline renders without crash)
2. StoryHomePage filter (confirm only 1 card shows)
3. Title card screen + App.tsx state (confirm video plays, Play button transitions correctly)
4. ChapterNav hide
5. Full part1/chapter1 architecture replication in sorry/ folder with placeholder content
6. Begin replacing content: music, narrative text, cues, scenes

---

## Assets You Will Need to Prepare

- `public/sorry-bg.mp4` — background video for the title card
- `src/experience/scenes/sorry/audio/` — ambient music file for the experience
- `src/experience/scenes/sorry/models/` — any .glb 3D models for the scene
- Voiceover audio files for narration cues (drop in `audio/` folder per scene)
