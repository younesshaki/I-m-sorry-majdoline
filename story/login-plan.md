# Login System — Implementation Plan

## Updated User Flow
```
Gate (preload) → Login Screen → Home (1 card: "Sorry") → Title Card (video + Play) → 3D Experience
```

New app screen state added:
```ts
type AppScreen = "gate" | "login" | "home" | "titlecard" | "experience";
```

---

## How the Login Works (Behavior)

- Two inputs: **username** + **password**
- The password is the same for everyone — it is a shared secret (a riddle only the right people can answer)
- The username is unique per person — no two people can pick the same name
- If the username is **new**: an account is created silently and the user enters
- If the username **already exists**: the password is verified and the user resumes their session
- If the username exists but the password is wrong: show an error
- Sessions persist — if a user comes back to the same browser they are logged in automatically and skip the login screen entirely
- Works across devices: logging in with the same username + correct password on a new device restores the same session and story progress

---

## Why This Approach (Technical Reasoning)

The existing system uses Supabase **anonymous auth** — each visitor gets a random UUID with no identity. That means:
- You cannot tell who visited on the Supabase dashboard
- Users can't resume their session from a different device
- There is no way to know when Dounia specifically logged in

The new system uses **real Supabase Auth accounts** (email + password under the hood), where the "email" is constructed as `username@majdoline.local` — a fake email format that Supabase accepts and hashes properly. This gives:
- A real persistent identity per username
- Cross-device session restore (Supabase handles tokens)
- Visibility on the Supabase dashboard: you can see every username that signed up and when
- The existing `story_states` table **works with zero changes** because it already links to `user_id` from `auth.users`

---

## Password Strategy

The password is shared — everyone uses the same one (the riddle answer). It is stored as an environment variable:
```
VITE_ACCESS_PASSWORD=<the answer to the riddle>
```

This value is used at login time to call Supabase Auth signUp/signIn. Supabase hashes it server-side — it is never stored in plain text anywhere. The `.env.local` file is gitignored so it is never exposed in the repo.

---

## Phase 1 — Supabase: New Table + Migration

**New file:** `supabase/migrations/002_profiles.sql`

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

-- Only the owner can read/write their own profile
alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
```

**Why a separate `profiles` table:**
- `auth.users` is Supabase-internal and not directly queryable from the client with RLS
- `profiles` stores the human-readable username visibly in the dashboard
- You can query it from the Supabase Studio table editor and immediately see "dounia logged in at [date]"

**Username uniqueness is enforced at the database level** via the `unique` constraint on `username`. Even if two people submit at the exact same millisecond, the DB rejects the second one.

---

## Phase 2 — Auth Service

**New file:** `src/lib/authService.ts`

This service handles all login logic. It is separate from the existing `supabaseStoryService` to keep concerns clean.

### Functions to implement:

#### `checkExistingSession(): Promise<AuthUser | null>`
- Calls `supabase.auth.getSession()`
- If a valid session exists, fetch the profile (username) from `profiles` table
- Returns `{ userId, username }` or null
- Called on app boot — if returns a user, skip the login screen entirely

#### `loginOrRegister(username: string, password: string): Promise<AuthResult>`
Logic flow:
1. Sanitize username: trim whitespace, lowercase, max 30 chars, alphanumeric + underscores only
2. Construct fake email: `` `${username}@majdoline.local` ``
3. **Try `signIn` first:**
   - `supabase.auth.signInWithPassword({ email, password })`
   - If success → update `last_seen_at` in profiles → return user
   - If error is "Invalid login credentials":
     - Check if username exists in `profiles` table via a separate query
     - If username exists → password was wrong → return error "Incorrect password"
     - If username does not exist → proceed to registration
4. **Register new user:**
   - `supabase.auth.signUp({ email, password })`
   - Insert row into `profiles`: `{ id: user.id, username }`
   - Return user
5. Handle edge cases: network error, Supabase down → return graceful error message

#### `logout(): Promise<void>`
- `supabase.auth.signOut()`
- Clears local session

### AuthResult type:
```ts
type AuthResult =
  | { success: true; user: { userId: string; username: string }; isNew: boolean }
  | { success: false; error: "wrong_password" | "username_taken" | "network_error" | "invalid_username" }
```

---

## Phase 3 — Update App.tsx State Machine

**File:** `src/App.tsx`

Add `"login"` to the screen type:
```ts
type AppScreen = "gate" | "login" | "home" | "titlecard" | "experience";
```

On gate completion (preload done):
1. Call `authService.checkExistingSession()`
2. If session found → go to `"home"` directly (skip login)
3. If no session → go to `"login"`

Add state for the logged-in user:
```ts
const [currentUser, setCurrentUser] = useState<{ userId: string; username: string } | null>(null);
```

Pass `currentUser` down to `StoryProvider` so it knows which user's state to load.

---

## Phase 4 — Login Screen Component

**New file:** `src/experience/ui/LoginScreen.tsx`

### Layout:
- Full screen — same visual treatment as the rest of the app (dark, cinematic)
- Centered card or minimal form — no loud UI, consistent with the emotional tone of the project
- Two inputs stacked vertically
- One submit button below

### Input 1 — Username:
```
placeholder: "choose a name"
type: text
maxLength: 30
```

### Input 2 — Password:
```
placeholder: "the password is the number of letters in the birthday jar + baby yoda's name"
type: password
```

### States to handle in the UI:
| State | What shows |
|---|---|
| Idle | Both inputs + button |
| Loading | Inputs disabled, button shows spinner |
| Wrong password | Red message: "incorrect password" |
| Username taken | Red message: "this name is already taken" |
| Invalid username | Red message: "username can only contain letters, numbers, and underscores" |
| Network error | Red message: "something went wrong, try again" |
| Success (new user) | Brief fade + transition to home |
| Success (returning) | Brief fade + transition to home |

### GSAP:
- Fade in on mount (same pattern as the rest of the app)
- On success: GSAP fade out → trigger screen transition

### No "sign up" vs "log in" toggle needed:
The system detects automatically whether the username is new or returning. The user just enters their name and the password — the system figures out the rest silently.

---

## Phase 5 — Connect StoryProvider to Real Auth

**File:** `src/experience/story/StoryProvider.tsx` and `src/experience/story/service/supabaseStoryService.ts`

Currently `ensureSession()` calls `signInAnonymously()`. This needs to change:

- If a user came through the login screen, they already have a real Supabase session
- `ensureSession()` should call `getSession()` first — if session exists, use it (no sign-in needed)
- Remove the `signInAnonymously()` fallback entirely — anonymous users should not be created anymore
- If no session is found (should not happen after login), redirect to login screen

This means story progress is automatically tied to the authenticated user's `user_id` with no changes to the `story_states` table schema or queries.

---

## Phase 6 — Supabase Dashboard Visibility

After this is implemented, in the Supabase Studio you will see:

**Authentication → Users tab:**
- Every user listed with their fake email (`dounia@majdoline.local`, `younes@majdoline.local`, etc.)
- `created_at` timestamp = first login
- `last_sign_in_at` = most recent login

**Table Editor → profiles table:**
- `username` column shows the actual chosen names cleanly
- `last_seen_at` updated on every login so you can track activity

To find Dounia specifically: filter `profiles` by `username = 'dounia'` (or whatever name she picks) and see `created_at` and `last_seen_at`.

---

## Files Touched Summary

| File | Type | Change |
|---|---|---|
| `supabase/migrations/002_profiles.sql` | **New** | profiles table + RLS policies |
| `src/lib/authService.ts` | **New** | loginOrRegister, checkExistingSession, logout |
| `src/App.tsx` | Modify | Add "login" screen state, session check on boot |
| `src/experience/ui/LoginScreen.tsx` | **New** | Login form UI with GSAP transitions |
| `src/experience/story/service/supabaseStoryService.ts` | Modify | Replace signInAnonymously with getSession |
| `src/experience/story/StoryProvider.tsx` | Modify | Accept userId from app-level auth |
| `.env.local` | Modify | Add VITE_ACCESS_PASSWORD |

**Zero changes to `story_states` table. Zero changes to existing chapter/scene system.**

---

## Edge Cases Covered

| Scenario | Handled By |
|---|---|
| Same username submitted twice simultaneously | DB unique constraint rejects second insert |
| User returns on same browser | `checkExistingSession()` skips login entirely |
| User returns on new device | signIn with username + password restores session cross-device |
| Wrong password attempt | signIn fails → check if username exists → return "wrong_password" |
| Network offline during login | try/catch → return "network_error" message |
| Username with spaces or special chars | Client-side sanitization before any DB call |
| Supabase Auth email confirmation | Must be **disabled** in Supabase dashboard (Auth → Settings → disable email confirmation) — otherwise new signUps require email verification which we don't want |

---

## One Required Supabase Dashboard Setting

Before implementation: go to **Supabase Dashboard → Authentication → Providers → Email** and:
- Turn off **"Confirm email"** — otherwise new users will be stuck waiting for a confirmation email that never arrives since the emails are fake

---

## Build Order

1. Apply migration `002_profiles.sql` to Supabase
2. Disable email confirmation in Supabase dashboard
3. Add `VITE_ACCESS_PASSWORD` to `.env.local`
4. Build `authService.ts`
5. Update `App.tsx` state machine + session check
6. Build `LoginScreen.tsx` UI
7. Update `supabaseStoryService.ts` to remove anonymous auth
8. Test: new user flow → session persist → returning user flow → wrong password
