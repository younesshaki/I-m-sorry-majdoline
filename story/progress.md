# Project Progress

Last updated: 2026-04-27  
Project: `I-m-sorry-majdoline`  
Current branch: `compression`  
Last pushed commit: `3d1e520 Add production media quality and admin tracking`  
Live domain: `https://ghostofmajdoline.life`

This document is the handoff file for future developers and AI agents. It describes where the project is now, what has been built, what is deployed, and what still needs care.

## Current Status

The project is a cinematic React/Vite/Three.js web experience built around a private apology story. It is deployed on Vercel and uses Supabase for auth, progress persistence, events, admin data, and storage-hosted media.

The latest successful production deployment was created with:

```sh
npx vercel deploy --prod --yes
```

The custom domain returned `HTTP 200` after deployment:

```txt
https://ghostofmajdoline.life
```

The Vercel-generated deployment URL was:

```txt
https://i-m-sorry-majdoline-he9pk6jd9-hakicsi89-5044s-projects.vercel.app
```

The Vercel-generated URL may be protected by Vercel SSO, but the custom domain is public.

## Local Git State At This Update

The branch `compression` is pushed to GitHub at commit `3d1e520`.

There are currently local changes after that push:

- `src/lib/authService.ts`
- `supabase/migrations/008_last_seen_trigger.sql`
- `story/progress.md` added by this documentation update

The local auth change removes a client-side `profiles.last_seen_at` update and expects `last_seen_at` to be updated server-side by migration `008_last_seen_trigger.sql` whenever a `session_started` event is inserted.

Important: migration `008_last_seen_trigger.sql` was not part of the last pushed commit or the last production deployment at the time this file was created.

## High-Level User Flow

The app flow is controlled mainly by `src/App.tsx`.

Current screen states:

```txt
gate -> home -> titlecard -> experience
admin
```

Main flow:

1. `PreloadGate`
   - Private username and two-step password/riddle gate.
   - Uses Supabase auth through `src/lib/authService.ts`.
   - Uses `PlaceholdersAndVanishInput`.
   - Uses the `Mileast` font for signup/gate text.

2. `StoryHomePage`
   - Shows the story/chapter card entry.
   - Entering the sorry chapter routes to the title card first.

3. `SorryTitleCard`
   - Cinematic title card before the actual sorry chapter.
   - Play button transitions into the `Experience`.

4. `Experience`
   - Renders the R3F canvas, loaders, story state, chapter navigation, background video layer, sorry text overlays, and sorry chapter progress.
   - For the sorry chapter, it shows a butterfly preload gate and blocks reveal until required assets are ready.

5. `SorryChapter`
   - Runs scenes 1-11 as the cinematic apology chapter.
   - Moves to the forgiveness choice scene.
   - Yes leads to scene 12.
   - No leads to the alternate ending.

6. `AdminPage`
   - Reached by `#admin`.
   - Requires the current logged-in profile to have `is_admin = true`.
   - Displays profiles, event history, yes/no counts, completions, and realtime event inserts.

## Main Technology Stack

- Vite
- React 18
- TypeScript
- Three.js / React Three Fiber / Drei
- GSAP
- Motion
- Supabase JS
- Supabase Auth, Postgres, Realtime, Storage
- Vercel
- Tailwind CSS v4 utilities plus custom CSS
- shadcn/Aceternity/React Bits inspired components integrated into local source

Primary commands:

```sh
npm run dev
npm run build
npm run preview
```

Vercel uses:

```json
{
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

## Deployment Status

Production deployment is working.

Vercel config:

```txt
vercel.json
```

Important settings:

- `installCommand`: `npm install --legacy-peer-deps`
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- SPA rewrite to `/index.html`

Last Vercel build completed successfully with:

- 2926 modules transformed
- Vite production build passed
- Warning only: large JS chunks over 500 KB
- Sass legacy JS API deprecation warning
- `npm audit` reported 3 moderate vulnerabilities during Vercel install

## Environment Variables

Local env file:

```txt
.env.local
```

Expected Vite variables:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_USE_BACKEND
VITE_ACCESS_PASSWORD
```

Do not commit `.env.local`.

## Supabase Project

Supabase project ref:

```txt
spheqdcagzndypxmqvuh
```

Public storage CDN base used in code:

```txt
https://spheqdcagzndypxmqvuh.supabase.co/storage/v1/object/public/sorry-media
```

Main bucket:

```txt
sorry-media
```

Supabase CLI login and project linking were already used successfully during development.

## Supabase Database

Migrations currently in the repo:

```txt
001_story_states.sql
002_profiles.sql
003_story_state_analytics.sql
004_story_events.sql
005_discord_notifier.sql
006_admin_access.sql
007_username_lookup.sql
008_last_seen_trigger.sql
```

Tables and functions:

- `story_states`
  - One durable state row per Supabase auth user.
  - Stores current part/chapter/scene, completed scenes, choices, analytics, preferences, checkpoint, and timestamps.

- `profiles`
  - One profile per Supabase auth user.
  - Stores username, `created_at`, `last_seen_at`, and `is_admin`.

- `story_events`
  - Append-only event table.
  - Tracks meaningful user actions: registration, session start, scene events, choice made, completion, heartbeat.

- `username_exists(p_username text)`
  - Security definer RPC.
  - Allows the client to know whether a username exists without exposing profile rows through RLS.
  - Used to distinguish wrong password from new registration.

- `notify_discord_on_story_event()`
  - Sends selected `story_events` to Discord using `pg_net`.
  - Important: the webhook URL is not hardcoded. It should be configured outside git via DB setting:
    ```sql
    alter database postgres set app.discord_webhook_url = '<discord webhook url>';
    ```

- `update_last_seen_on_session_started()`
  - Migration `008`.
  - Updates `profiles.last_seen_at` whenever a `session_started` event is inserted.
  - This is local/unpushed at the time this file was created.

RLS model:

- Users can read/write their own story state.
- Users can insert their own events.
- Admins can read all profiles, states, and events through policies added in migration `006`.

## Authentication

Auth is username-based but implemented through Supabase email/password:

```ts
username -> `${username}@majdoline.local`
```

Files:

```txt
src/lib/authService.ts
src/lib/supabase.ts
src/experience/ui/PreloadGate.tsx
```

Gate flow:

- Username is sanitized to lowercase alphanumeric/underscore.
- User must pass the private two-step riddle/password flow.
- App then calls `loginOrRegister`.
- Existing users sign in.
- New users sign up and get a profile row.
- Session start/registration events are logged through `eventsService`.

Important implementation detail:

- Because profile rows are protected by RLS, username existence is checked through the `username_exists` RPC instead of a direct `profiles.select`.

## Story State

Core files:

```txt
src/experience/story/types.ts
src/experience/story/StoryProvider.tsx
src/experience/story/service/localStoryService.ts
src/experience/story/service/supabaseStoryService.ts
src/experience/story/service/storyDefaults.ts
```

The app uses a `StoryService` abstraction.

Current behavior:

- `StoryProvider` starts with local service.
- If `VITE_USE_BACKEND === "true"`, it tries Supabase.
- If Supabase load fails, it falls back to local state.
- State is normalized through `storyDefaults.ts`.
- User-scoped local storage exists so local state can be migrated safely by Supabase user.

This is a strong architectural choice because the UI is mostly isolated from whether state comes from localStorage or Supabase.

## Sorry Chapter

Core folder:

```txt
src/experience/scenes/sorry
```

The current cinematic chapter has:

- 11 narrative scenes
- forgiveness choice scene
- scene 12 for the yes path
- no-ending scene for the no path
- background videos mapped across the scenes
- audio tracks mapped across scene ranges
- progress indicator that reaches 100% at the yes/no choice page
- a black intro/fade-in video reveal
- 3D model preloading after chapter mount

Main files:

```txt
src/experience/scenes/sorry/index.tsx
src/experience/scenes/sorry/data.ts
src/experience/scenes/sorry/BackgroundVideo.tsx
src/experience/scenes/sorry/SorryTimeline.ts
src/experience/scenes/sorry/SorryNarrative.tsx
src/experience/scenes/sorry/SorryLyricsDisplay.tsx
src/experience/scenes/sorry/ForgivenessScene.tsx
src/experience/scenes/sorry/Scene12.tsx
src/experience/scenes/sorry/NoEndingScene.tsx
```

Scene text lives in:

```txt
src/experience/scenes/sorry/scenes/scene-*/content.ts
```

Effects supported in narrative lines:

- blur reveal text
- red gradient highlights on significant words
- flip words on configured target words
- scene-specific fonts

## Sorry Chapter Video System

Video assets are Supabase-hosted in two qualities:

High quality:

```txt
video/blenderscene1-original-v1.mp4
video/blenderscene2-original-v1.mp4
video/blenderscene3-original-v1.mp4
video/blenderscene5-original-v1.mp4
video/blenderscenefinal-original-v1.mp4
```

Normal quality:

```txt
video/blenderscene1-crf22-v1.mp4
video/blenderscene2-crf22-v1.mp4
video/blenderscene3-crf22-v1.mp4
video/blenderscene5-crf22-v1.mp4
video/blenderscenefinal-crf22-v1.mp4
```

Files:

```txt
src/experience/scenes/sorry/data/sceneAssets.ts
src/experience/scenes/sorry/videoPreloadCache.ts
src/experience/scenes/sorry/BackgroundVideo.tsx
```

Quality modes:

- `high`
  - default
  - original Supabase videos
  - first two videos are fully fetched as blobs during butterfly preload
  - remaining originals stream with lookahead preload

- `normal`
  - compressed Supabase videos
  - first two videos are warmed through browser video preload
  - remaining compressed videos stream normally with lookahead

Preference storage:

```txt
nomad.media-quality.v1
```

Settings UI:

```txt
src/experience/ui/MediaQualitySettings.tsx
src/experience/ui/MediaQualitySettings.css
```

The settings button is visible outside the actual sorry chapter and hidden during the chapter so the quality cannot change mid-preload/playback.

## Background Video Playback

`BackgroundVideo.tsx` uses:

- two visible video elements for double-buffered transitions
- one hidden preload video for lookahead
- scene-to-video mapping
- pause points for cinematic timing
- black base background
- slow intro fade from black to first video
- `shouldPlay` so videos do not play behind the butterfly preload gate

The first video should not advance while the loader is blocking.

## Audio

Outside sorry chapter:

```txt
src/experience/audio/OutsideSorryMusic.tsx
```

Uses:

```txt
audio/bts-fake-love-orchestral-slowed-reverb-v1.mp3
```

This plays from signup/home/titlecard/butterfly preload and fades out only when the sorry chapter is actually revealed.

Sorry chapter audio:

```txt
src/experience/scenes/sorry/audio/index.ts
src/experience/scenes/sorry/useSorrySceneMusic.ts
```

Current mapping:

- scenes 1-4: `bts-black-swan-fake-love-orchestra-v1.mp3`
- scenes 5-8: `coldplay-viva-la-vida-slowed-reverb-v1.mp3`
- scenes 9-11: `justin-bieber-ghost-slowed-v1.mp3`
- forgiveness + scene 12: `enhypen-fatal-trouble-v1.mp3`

The butterfly preloader no longer has its own audio wired. Its `loaderAudio` is `null`.

## 3D Models

Models are hosted in Supabase storage and referenced from:

```txt
src/experience/scenes/sorry/data/sceneAssets.ts
```

Current model URLs:

- baby yoda centerpiece
- octopus plush
- pancake
- piano rose
- stitch

These are intentionally not part of the butterfly preload gate. They are preloaded after the sorry chapter mounts so they should be ready by scene 12.

## Fonts

Scene fonts:

```txt
src/experience/scenes/shared/sceneFonts.css
```

Current fonts:

- `Moralana DEMO.otf`
  - used broadly outside the later sorry scenes and in early scenes 1-8

- `Higher Jump.ttf`
  - used for later sorry scenes

- `Mileast.otf`
  - used for signup/preload gate text and the media quality settings component

Git tracking:

- `.gitignore` ignores font files by default.
- Specific font files are explicitly unignored so deployment from GitHub has them:
  - Moralana
  - Higher Jump
  - Mileast

## UI Components Added Or Replaced

Aceternity/shadcn/React Bits inspired components were integrated directly into the app source.

Notable components/features:

- 3D card option cards before the story scene
- hover border gradient buttons
- placeholders-and-vanish input on signup
- blur text reveal
- gradient text highlights
- flip words
- media quality settings menu
- circular sorry chapter progress indicator
- phone/laptop notice

The app uses `lucide-react` for the settings icon.

## Admin And Event Tracking

Admin page:

```txt
src/experience/ui/AdminPage.tsx
src/experience/ui/AdminPage.css
```

Event logging:

```txt
src/lib/eventsService.ts
```

Tracked events currently include:

- `registered`
- `session_started`
- `experience_entered`
- `scene_entered`
- `choice_made`
- `chapter_completed`
- `heartbeat`

The admin page shows:

- all profiles
- all recent events
- yes/no counts
- completion counts
- per-user filtering
- realtime insert updates through Supabase Realtime

Access:

- Navigate to `#admin`
- Must be logged in
- Current profile must have `is_admin = true`

## Important Security Notes

Do not commit:

- `.env`
- `.env.local`
- service role keys
- Discord webhook URLs
- Supabase service tokens

The Discord webhook was intentionally removed from migration `005` and replaced with a database setting lookup.

If Discord notifications are needed, configure the webhook in Supabase outside the repo:

```sql
alter database postgres set app.discord_webhook_url = '<discord webhook url>';
```

Admin access depends on RLS and `profiles.is_admin`. Verify these policies before considering the admin feature production-hardened.

## Current Validation

Recent validation performed:

- `npm run build` passes locally.
- Vercel production build passed.
- Custom domain returned `HTTP 200`.
- All high/normal sorry background video URLs returned HTTP `206` byte-range responses when verified.
- Local dev server was cleaned up after duplicate Vite processes caused browser confusion.

Known warnings:

- Vite reports a large JS chunk over 500 KB.
- Sass reports legacy JS API deprecation warning.
- Vercel install reported 3 moderate npm audit vulnerabilities.

## Known Risks

Performance:

- Main JS bundle is large.
- High quality mode intentionally downloads about 74 MB for the first two original videos before the sorry chapter reveals.
- Video smoothness still depends on device/GPU/network despite preload improvements.
- 3D, video, audio, fonts, and animation all compete for resources.

Reliability:

- Most QA is manual.
- There are no automated tests for auth, Supabase writes, media preload, or scene progression.
- Browser autoplay/audio behavior can vary.
- Supabase/network failures are mostly fail-soft, but not all user-facing errors are polished.

Security:

- Admin tools need continued RLS review.
- Password/riddle values live in frontend source, so this is private-by-obscurity, not strong access control.
- Discord webhook must remain external to git.

Maintainability:

- The project grew quickly and has organic architecture in places.
- Some docs are outdated plans rather than current truth.
- Several heavy features sit in the main app bundle and should eventually be code-split.

## Recommended Next Steps

Highest priority:

1. Decide whether to push and deploy the local `008_last_seen_trigger.sql` change.
2. Confirm all Supabase migrations are applied in the hosted project.
3. Confirm the admin user has `profiles.is_admin = true`.
4. Keep `story/progress.md` updated after every major deployment or database change.

Performance:

1. Add code splitting for admin page and sorry chapter.
2. Consider an `auto` quality mode later, but current manual high/normal is working.
3. Generate poster images for each background video to avoid blank frames if a future transition loads late.
4. Track real load/preload timings through `story_events` if needed.

Production discipline:

1. Add a lightweight CI check that runs `npm run build`.
2. Add linting if desired.
3. Add a deployment checklist.
4. Document env vars and Supabase setup in `README.md`.

Security:

1. Review RLS policies with the hosted Supabase state.
2. Keep webhook and service keys out of the repo.
3. Treat the gate as an emotional/private access layer, not a serious security boundary.

Documentation:

1. Update the root `README.md`; it still says this is a React Three Fiber boilerplate.
2. Keep old plan docs, but mark outdated ones clearly.
3. Use this file as the current source of truth.

## How To Continue As A Developer Or AI Agent

Before changing code:

```sh
git status -sb
npm run build
```

Before deploying:

```sh
npm run build
npx vercel deploy --prod --yes
```

Before pushing:

```sh
rg -n "discord.com/api/webhooks|service_role|SUPABASE_SERVICE|Bearer eyJ|SECRET|PRIVATE_KEY" src supabase . --glob '!node_modules/**' --glob '!dist/**' --glob '!.git/**' --glob '!.env*'
git status -sb
git add -A
git commit -m "<clear commit message>"
git push -u origin compression
```

When making media changes:

- Upload large videos/audio/models to Supabase storage.
- Do not commit heavy local media unless explicitly whitelisted in `.gitignore`.
- Verify public URLs with byte-range requests for videos:

```sh
curl -L -s -o /dev/null -w "%{http_code} %{size_download}" -r 0-0 "<url>"
```

When changing Supabase:

- Add a migration under `supabase/migrations`.
- Do not put secrets in migrations.
- Verify RLS behavior from both normal user and admin perspectives.

