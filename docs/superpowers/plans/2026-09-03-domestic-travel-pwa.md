# Domestic Travel PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first version of a private Taiwan domestic travel PWA with login, saved places, visited reviews, itinerary planning, and a Google Maps API placeholder that does not expose secrets.

**Architecture:** Use a Next.js app deployed on Vercel, with client UI components for the mobile PWA experience and server API routes for secret-backed operations. Use Supabase Auth, database tables, and Row Level Security for persistent private data; Google Maps resolving is routed through a Vercel server endpoint and gracefully falls back when no key exists.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Supabase JS, dnd-kit, lucide-react, Vercel, Supabase Auth/Postgres/RLS.

**Spec:** `docs/superpowers/specs/2026-09-03-domestic-travel-pwa-design.md`

## Global Constraints

- Source code goes to GitHub, hosting goes to Vercel, data goes to Supabase.
- Google Maps API key must never be committed or exposed in frontend code.
- Use `GOOGLE_MAPS_API_KEY` only from server-side code.
- First version must work without a Google API key via manual place creation.
- Use one fixed invited/login account from the user's perspective; do not build public registration.
- Main tabs are exactly `探索`, `收藏`, `行程`, `我的`.
- Login copy uses `旅途收藏`, `收藏回憶，規劃屬於我們的旅程`, `帳號`, `密碼`, `開始規劃`.
- Theme modes are follow system, light, and dark.
- Use warm earth-tone light and dark palettes from the spec.
- 收藏 and 我的 use category tabs and collapsible city sections.
- 行程 supports day tabs and drag-and-drop ordering.

---

## File Structure

Create a Next.js app in the workspace root.

- `package.json`: dependencies, scripts, project metadata.
- `next.config.ts`: Next.js configuration.
- `tailwind.config.ts`: earth-tone theme tokens.
- `postcss.config.js`: Tailwind PostCSS setup.
- `tsconfig.json`: TypeScript config.
- `app/layout.tsx`: root shell, metadata, PWA manifest link.
- `app/page.tsx`: auth gate and main app entry.
- `app/globals.css`: global styles, light/dark CSS variables, mobile layout defaults.
- `app/manifest.ts`: PWA manifest.
- `app/api/places/resolve/route.ts`: server-only Google Maps URL resolving placeholder.
- `lib/supabase/client.ts`: browser Supabase client.
- `lib/supabase/server.ts`: server Supabase helper if needed.
- `lib/types.ts`: shared app types.
- `lib/mockData.ts`: optional seed/demo data for local UI before Supabase is configured.
- `lib/placeUtils.ts`: grouping, filtering, status, and category helpers.
- `components/auth/LoginScreen.tsx`: login page.
- `components/layout/AppShell.tsx`: mobile frame, tabs, theme state.
- `components/explore/ExplorePage.tsx`: Google URL input, manual add, preview sheet.
- `components/places/PlaceCard.tsx`: reusable place card for 收藏 and 我的.
- `components/places/CityAccordion.tsx`: collapsible city grouping.
- `components/places/PlaceDetailSheet.tsx`: detail, maps link, review, add to itinerary.
- `components/places/ReviewSheet.tsx`: rating and review form.
- `components/favorites/FavoritesPage.tsx`: wishlist places.
- `components/mine/MyPlacesPage.tsx`: visited places.
- `components/itinerary/ItineraryPage.tsx`: trip/day timeline.
- `components/itinerary/TripEditorSheet.tsx`: create/edit trip.
- `components/itinerary/AddToTripSheet.tsx`: choose trip/day/time.
- `components/itinerary/TransportEditorSheet.tsx`: transport entry form.
- `components/ui/*`: small local UI primitives.
- `supabase/schema.sql`: tables, indexes, RLS policies.
- `supabase/seed.sql`: optional sample data for local setup.
- `.env.example`: required environment variable names only, no secrets.
- `README.md`: setup, Supabase, Vercel, Google API instructions.

---

### Task 1: Project Scaffold And Design Tokens

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `tsconfig.json`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `lib/types.ts`
- Create: `components/layout/AppShell.tsx`
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Sheet.tsx`

**Interfaces:**
- Produces: `AppShell({ childrenByTab }: { childrenByTab: Record<AppTab, React.ReactNode> })`.
- Produces: `AppTab = "explore" | "favorites" | "itinerary" | "mine"`.
- Produces: shared types `PlaceCategory`, `ThemeMode`.

- [ ] **Step 1: Initialize Next.js dependencies**

Run:

```bash
npm create next-app@latest . -- --ts --tailwind --eslint --app --src-dir false --import-alias "@/*"
npm install @supabase/supabase-js @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react clsx
```

Expected: Next.js project files exist in the workspace root.

- [ ] **Step 2: Define shared types**

Create `lib/types.ts` with:

```ts
export type AppTab = "explore" | "favorites" | "itinerary" | "mine";
export type ThemeMode = "system" | "light" | "dark";
export type PlaceCategory = "住宿" | "食物" | "景點" | "交通" | "其他";
export type PlaceStatus = "wishlist" | "visited";

export interface Place {
  id: string;
  userId: string;
  name: string;
  category: PlaceCategory;
  city: string;
  address: string;
  googleMapsUrl?: string;
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  photoUrl?: string;
  note?: string;
  status: PlaceStatus;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 3: Add earth-tone CSS variables**

In `app/globals.css`, add CSS variables for light/dark palettes from the spec and base mobile styles.

- [ ] **Step 4: Build app shell**

Create `components/layout/AppShell.tsx` with bottom tabs `探索`, `收藏`, `行程`, `我的`, theme state, and a fixed mobile-first viewport layout.

- [ ] **Step 5: Verify scaffold**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands pass.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: scaffold travel pwa"
```

---

### Task 2: Supabase Schema, Client, And Environment Contract

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/seed.sql`
- Create: `lib/supabase/client.ts`
- Create: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Produces: `createBrowserSupabaseClient()`.
- Produces: env names `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GOOGLE_MAPS_API_KEY`.

- [ ] **Step 1: Create environment template**

Create `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_MAPS_API_KEY=
```

- [ ] **Step 2: Write Supabase schema**

Create `supabase/schema.sql` with tables `profiles`, `places`, `place_reviews`, `trips`, and `trip_items`. Enable RLS on every table. Policies must use `auth.uid() = user_id` or ownership through parent trip/place.

- [ ] **Step 3: Create Supabase client**

Create `lib/supabase/client.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
```

- [ ] **Step 4: Document setup**

Update `README.md` with steps for creating a Supabase project, running `supabase/schema.sql`, creating the one login account manually in Supabase Auth, and adding Vercel environment variables.

- [ ] **Step 5: Verify no secrets are committed**

Run:

```bash
rg -n "AIza|service_role|GOOGLE_MAPS_API_KEY=.*[A-Za-z0-9_-]" .
```

Expected: no real key values are found.

- [ ] **Step 6: Commit**

```bash
git add .env.example README.md lib/supabase/client.ts supabase
git commit -m "feat: add supabase data contract"
```

---

### Task 3: Login Gate

**Files:**
- Create: `components/auth/LoginScreen.tsx`
- Modify: `app/page.tsx`
- Modify: `components/layout/AppShell.tsx`

**Interfaces:**
- Consumes: `createBrowserSupabaseClient()`.
- Produces: authenticated access gate.

- [ ] **Step 1: Build login screen**

Create a login form with labels `帳號`, `密碼`, checkbox `記住帳號密碼`, button `開始規劃`, app title `旅途收藏`, and subtitle `收藏回憶，規劃屬於我們的旅程`.

- [ ] **Step 2: Implement Supabase sign-in**

Use `supabase.auth.signInWithPassword({ email: account, password })`. The UI label remains `帳號`, but the first version can treat it as the Supabase email login identifier.

- [ ] **Step 3: Persist session**

Use Supabase session persistence. Store only the account identifier in local storage when `記住帳號密碼` is checked. Do not store plaintext password in local storage.

- [ ] **Step 4: Gate app shell**

In `app/page.tsx`, show `LoginScreen` until Supabase returns a valid session; then show `AppShell`.

- [ ] **Step 5: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass. Manual local login can be tested after Supabase env vars are configured.

- [ ] **Step 6: Commit**

```bash
git add app components/auth components/layout
git commit -m "feat: add private login gate"
```

---

### Task 4: Place Storage, Grouping, And Manual Add

**Files:**
- Create: `lib/placeUtils.ts`
- Create: `components/explore/ExplorePage.tsx`
- Create: `components/places/PlaceCard.tsx`
- Create: `components/places/CityAccordion.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `groupPlacesByCityAndCategory(places, categoryFilter)`.
- Produces: manual place create flow writing to `places`.

- [ ] **Step 1: Implement grouping helper**

Create `groupPlacesByCityAndCategory(places: Place[], categoryFilter: PlaceCategory | "全部")` that returns grouped cities and categories, excluding categories with no places.

- [ ] **Step 2: Build manual add form**

In `ExplorePage`, provide a manual add option with fields: name, category, city, address, Google Maps URL, note, photo URL.

- [ ] **Step 3: Save manual place**

Insert into Supabase `places` with `status = "wishlist"` and current `user_id`.

- [ ] **Step 4: Show saved feedback**

After save, clear the form and show a concise success message.

- [ ] **Step 5: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add lib/placeUtils.ts components/explore components/places app/page.tsx
git commit -m "feat: add manual place collection"
```

---

### Task 5: Google Maps Resolve API Placeholder

**Files:**
- Create: `app/api/places/resolve/route.ts`
- Modify: `components/explore/ExplorePage.tsx`

**Interfaces:**
- Produces: `POST /api/places/resolve` accepting `{ url: string }`.
- Returns: `{ configured: false, message: string }` when no key exists.
- Returns: normalized place preview when key exists in a later enhancement.

- [ ] **Step 1: Add server endpoint**

Create route handler that reads `process.env.GOOGLE_MAPS_API_KEY`. If missing, return HTTP 200:

```json
{
  "configured": false,
  "message": "Google Maps API 尚未設定，請先使用手動新增。"
}
```

- [ ] **Step 2: Add URL search UI**

In `ExplorePage`, add input `貼上 Google Maps 網址` and button `搜尋`.

- [ ] **Step 3: Connect search to endpoint**

When the response is `configured: false`, show the message and open the manual add form with the pasted URL filled in.

- [ ] **Step 4: Verify key is server-only**

Run:

```bash
rg -n "GOOGLE_MAPS_API_KEY" app components lib
```

Expected: only `app/api/places/resolve/route.ts` references `GOOGLE_MAPS_API_KEY`.

- [ ] **Step 5: Commit**

```bash
git add app/api/places/resolve components/explore/ExplorePage.tsx
git commit -m "feat: add google maps resolve placeholder"
```

---

### Task 6: 收藏 Page

**Files:**
- Create: `components/favorites/FavoritesPage.tsx`
- Modify: `components/places/PlaceCard.tsx`
- Modify: `components/places/CityAccordion.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: grouped wishlist places from Supabase.
- Produces: category tabs, collapsible city sections, add-to-trip trigger, review trigger.

- [ ] **Step 1: Fetch wishlist places**

Query `places` where `status = "wishlist"` and `user_id` is the current user.

- [ ] **Step 2: Add category tabs**

Render tabs `全部`, `住宿`, `食物`, `景點`, `交通`.

- [ ] **Step 3: Add city accordions**

Render collapsed city sections by default except the first city with data.

- [ ] **Step 4: Match requested card layout**

Render each item as:

```text
店名    Google ★4.4    +
[橫向照片]
```

- [ ] **Step 5: Add primary actions**

Support opening Google Maps, opening detail sheet, adding to itinerary, editing note/category, and deleting with confirmation.

- [ ] **Step 6: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add components/favorites components/places app/page.tsx
git commit -m "feat: add favorites organization"
```

---

### Task 7: 我的 Page And Review Flow

**Files:**
- Create: `components/mine/MyPlacesPage.tsx`
- Create: `components/places/ReviewSheet.tsx`
- Modify: `components/places/PlaceDetailSheet.tsx`
- Modify: `components/favorites/FavoritesPage.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: review flow that writes `place_reviews` and updates `places.status` to `visited`.
- Produces: visited places page grouped like 收藏.

- [ ] **Step 1: Build review sheet**

Fields: personal star rating 1-5, personal review text, visited date.

- [ ] **Step 2: Save review**

On submit, upsert into `place_reviews`, then update `places.status = "visited"`.

- [ ] **Step 3: Build 我的 page**

Query visited places and join/load their personal reviews.

- [ ] **Step 4: Render visited card**

Display:

```text
阿堂鹹粥  Google ★4.4 / 我的 ★5
很好吃，下次會再去
[橫向照片]
[再加入行程] [編輯評價]
```

- [ ] **Step 5: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add components/mine components/places components/favorites app/page.tsx
git commit -m "feat: add visited reviews"
```

---

### Task 8: Trips And Itinerary Planner

**Files:**
- Create: `components/itinerary/ItineraryPage.tsx`
- Create: `components/itinerary/TripEditorSheet.tsx`
- Create: `components/itinerary/AddToTripSheet.tsx`
- Create: `components/itinerary/TransportEditorSheet.tsx`
- Modify: `components/favorites/FavoritesPage.tsx`
- Modify: `components/mine/MyPlacesPage.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: create/edit trips.
- Produces: add place to selected trip/day/time.
- Produces: manual transport item creation.

- [ ] **Step 1: Build trip create/edit sheet**

Fields: trip name, start date, end date, note.

- [ ] **Step 2: Build day tabs**

Derive Day 1 through Day N from trip date range.

- [ ] **Step 3: Build timeline item UI**

Display smaller time, bold title, secondary details, `評價`, `刪除`, and drag handle.

- [ ] **Step 4: Add place to trip**

From 收藏 and 我的, open `AddToTripSheet`, choose trip, day, and time, then create `trip_items`.

- [ ] **Step 5: Add transport item**

Use `TransportEditorSheet` fields from the spec and save to `trip_items` with `type = "transport"`.

- [ ] **Step 6: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add components/itinerary components/favorites components/mine app/page.tsx
git commit -m "feat: add itinerary planning"
```

---

### Task 9: Drag-And-Drop Ordering

**Files:**
- Modify: `components/itinerary/ItineraryPage.tsx`
- Modify: `lib/types.ts`

**Interfaces:**
- Consumes: `trip_items.sort_order`.
- Produces: drag reorder that persists new `sort_order` values.

- [ ] **Step 1: Add sortable list**

Use `@dnd-kit/core` and `@dnd-kit/sortable` for itinerary items in the selected day.

- [ ] **Step 2: Persist new order**

After drag end, update each visible item's `sort_order` in Supabase.

- [ ] **Step 3: Keep touch behavior mobile-friendly**

Use drag handles so scrolling the itinerary still works on mobile.

- [ ] **Step 4: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add components/itinerary/ItineraryPage.tsx lib/types.ts
git commit -m "feat: persist itinerary drag ordering"
```

---

### Task 10: PWA, Deployment Docs, And Final Verification

**Files:**
- Create: `app/manifest.ts`
- Create: `public/icon-192.png`
- Create: `public/icon-512.png`
- Modify: `app/layout.tsx`
- Modify: `README.md`

**Interfaces:**
- Produces: installable PWA metadata.
- Produces: deployment instructions for GitHub, Vercel, Supabase, and future Google key setup.

- [ ] **Step 1: Add manifest**

Create app manifest with name `旅途收藏`, display `standalone`, start URL `/`, and theme colors matching light/dark design.

- [ ] **Step 2: Add app icons**

Create simple earth-tone travel app icons in `public/icon-192.png` and `public/icon-512.png`.

- [ ] **Step 3: Update metadata**

In `app/layout.tsx`, set app title, description, viewport, manifest, and theme color metadata.

- [ ] **Step 4: Update README**

Document:

- local install and dev server
- Supabase environment variables
- one-account Supabase Auth setup
- Vercel deployment
- Google Maps key placeholder
- how to add to iPhone home screen

- [ ] **Step 5: Final verification**

Run:

```bash
npm run lint
npm run build
rg -n "AIza|service_role|GOOGLE_MAPS_API_KEY=.*[A-Za-z0-9_-]" .
```

Expected: lint passes, build passes, and no committed secrets are found.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: finalize pwa deployment setup"
```

---

## Self-Review

Spec coverage:

- Login: Task 3.
- Theme and visual system: Task 1 and Task 10.
- 探索 and manual add: Task 4 and Task 5.
- Google API key safety: Task 5 and Task 10.
- 收藏: Task 6.
- 我的 and review movement: Task 7.
- 行程 and transport: Task 8.
- Drag reorder: Task 9.
- PWA and deployment: Task 10.
- Supabase persistence and RLS: Task 2.

Known implementation notes:

- The first implementation must not block on a Google Maps key.
- The login "帳號" field maps to Supabase email login internally.
- Plaintext password should not be remembered in local storage; session persistence handles staying logged in.
- The workspace is not currently a Git repository, so the first execution step should initialize Git before the first commit if the user wants commits.
