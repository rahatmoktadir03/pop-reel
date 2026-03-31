# PopReel — Full Rebuild Changelog

## Overview

Complete overhaul of the PopReel TikTok-clone project. The original codebase had critical bugs
(broken imports, wrong router, missing utility files, no database) that prevented it from running.
This rebuild fixes all issues and adds a production-grade feature set.

---

## 1. Dependencies Added

```
prisma@6          — ORM for SQLite database
@prisma/client@6  — Prisma runtime client
swr               — Data fetching hooks
clsx              — Conditional classnames utility
react-hot-toast   — Toast notifications
@aws-sdk/s3-request-presigner — Presigned S3 URLs
ts-node           — TypeScript execution for seeding
```

Downgraded `prisma` from auto-installed v7 to v6 — v7 removed `url` from schema
and required a `prisma.config.ts` adapter setup not compatible with this stack.

---

## 2. Database — Prisma + SQLite

**New file:** `prisma/schema.prisma`

Models:
| Model   | Purpose |
|---------|---------|
| User    | Synced from Clerk on first action |
| Video   | Title, description, URL, tags (JSON string), views, status |
| Like    | userId + videoId unique pair |
| Save    | userId + videoId unique pair |
| Comment | Text, userId, videoId |
| Follow  | followerId + followingId unique pair |
| View    | watchTime per user per video (feeds recommendation engine) |

**New file:** `prisma/seed.ts`
- Creates 5 demo users
- Creates 11 demo videos using real publicly accessible MP4 files
  (commondatastorage.googleapis.com sample videos)
- Creates follow relationships between demo users

Run with: `npm run seed`

---

## 3. Infrastructure / Library Files

### `src/lib/prisma.ts` *(new)*
Singleton Prisma client — prevents connection exhaustion in dev with hot reload.

### `src/lib/auth.ts` *(new)*
- `getCurrentUserId()` — wraps Clerk `auth()`
- `getOrCreateUser()` — syncs Clerk user into the DB on first authenticated action
- `VideoWithMeta` type — shared type for enriched video responses

### `src/utils/googleVision.ts` *(new — was missing, caused runtime crash)*
- `moderateContent(imageBase64)` — calls Google Vision safe search API
- Gracefully skips moderation if `GOOGLE_APPLICATION_CREDENTIALS` is not set
- Handles Vision API's enum type for likelihood values

### `src/utils/s3.ts` *(new)*
- `uploadFile()` — uploads to S3 if configured, falls back to `public/uploads/` locally
- `deleteFile()` — removes from S3 or local filesystem
- `getPresignedUploadUrl()` — generates presigned PUT URLs

### `src/utils/time.ts` *(new)*
- `formatDistanceToNow()` — human-readable relative timestamps ("2h ago", "3d ago")

---

## 4. API Routes

All routes are new or completely rewritten.

### Videos
| Route | Method | Description |
|-------|--------|-------------|
| `/api/videos` | GET | Paginated feed with cursor pagination. Supports `type=for_you\|following`. Enriches with `isLiked`, `isSaved`, `isFollowing` per user. |
| `/api/videos` | POST | Create video metadata after upload |
| `/api/videos/[id]` | GET | Single video with user interaction state |
| `/api/videos/[id]` | DELETE | Owner-only delete (removes from S3/disk too) |
| `/api/videos/[id]/like` | POST | Toggle like — returns `{ liked, likeCount }` |
| `/api/videos/[id]/save` | POST | Toggle save — returns `{ saved }` |
| `/api/videos/[id]/comments` | GET | Paginated comments (newest first) |
| `/api/videos/[id]/comments` | POST | Add comment (auth required) |
| `/api/videos/[id]/view` | POST | Record view + watch time (non-critical, never fails response) |

### Users
| Route | Method | Description |
|-------|--------|-------------|
| `/api/users/sync` | POST | Upsert Clerk user into DB |
| `/api/users/[id]` | GET | Profile data + follower count + `isFollowing` |
| `/api/users/[id]` | PATCH | Update bio / displayName |
| `/api/users/[id]/follow` | POST | Toggle follow — returns `{ following, followerCount }` |
| `/api/users/[id]/videos` | GET | User's videos or saved videos (`?tab=saved`) |

### Discovery
| Route | Method | Description |
|-------|--------|-------------|
| `/api/recommendations` | GET | Adaptive scored feed (see algorithm below) |
| `/api/search` | GET | Full-text search on title, description, tags, username |
| `/api/upload` | POST | Receives video file, runs moderation, uploads to S3 or disk |

### Recommendation Algorithm (`/api/recommendations`)
```
score = 0.30 × likeCount
      + 0.05 × viewCount
      + recencyScore      (0–100, decays over 30 days)
      + 20 × tagAffinity  (overlap with user's watch history tags)
      + 50 × isFollowing  (boost for followed creators)
```
- Top 70% sorted by score, bottom 30% shuffled for diversity
- Falls back to pure popularity + recency for unauthenticated users
- Excludes already-seen video IDs via `?exclude=id1,id2,...`

---

## 5. UI Components

### `src/app/components/Sidebar.tsx` *(rewritten)*
- Desktop fixed left sidebar (hidden on mobile)
- Active route highlighting with pink accent
- Links: For You, Explore, Upload, Saved, Profile
- Shows Clerk UserButton + username when signed in
- Sign In button when signed out

### `src/app/components/BottomNav.tsx` *(new)*
- Mobile-only fixed bottom nav bar
- 5 tabs: Home, Explore, Upload (pink accent), Saved, Profile
- Active tab highlights with pink icon

### `src/app/components/VideoCard.tsx` *(complete rewrite)*
- Full-screen video with object-contain display
- Auto-play/pause via `isActive` prop from IntersectionObserver
- Play/pause on tap, pause indicator overlay
- Right-side action buttons: Avatar+Follow, Like, Comment, Save, Share, Mute, Owner menu
- Like/save/follow all optimistically updated with server sync
- Share uses Web Share API with clipboard fallback
- Records view after 3 seconds of watching
- Owner-only delete with confirmation
- Hashtag links to `/explore?tag=...`

### `src/app/components/VideoFeed.tsx` *(new)*
- Snap-scroll container (`snap-y mandatory`)
- IntersectionObserver detects active video (70% threshold)
- Loads more videos when within 3 of the end
- Global mute state shared across all cards
- Accepts `initialVideos` for SSR pre-population
- Deduplicates by ID when loading more

### `src/app/components/CommentDrawer.tsx` *(complete rewrite)*
- Slide-up bottom sheet (70vh)
- Fetches comments on open, shows loading spinner
- Real-time comment posting with optimistic count update
- Shows relative timestamps
- Blocks body scroll while open
- Auth gate with sign-in link

### `src/app/components/UploadForm.tsx` *(new)*
- 3-step flow: Select → Details → Uploading → Done
- Drag-and-drop file zone or click-to-browse
- Video preview with remove button
- Title (required), description, tags (up to 8)
- Suggested tag chips
- Captures first video frame for Google Vision moderation
- Progress bar during upload
- Redirects to feed on success

### `src/app/components/VideoGrid.tsx` *(new)*
- Responsive grid: 2 / 3 / 4 columns
- Shows video thumbnail or `<video preload="metadata">` still frame
- Hover overlay with play icon
- Like + comment count overlay
- Links to `/video/[id]`

---

## 6. Pages

### `src/app/page.tsx` *(rewritten)*
Home feed — renders `<VideoFeed fetchUrl="/api/recommendations" />`

### `src/app/layout.tsx` *(rewritten)*
- Wraps everything in `ClerkProvider`
- Renders `<Sidebar>` (desktop) and `<BottomNav>` (mobile)
- Adds `<Toaster>` for toast notifications
- `export const dynamic = "force-dynamic"` prevents invalid static prerender with placeholder Clerk keys
- `viewport` export for `themeColor` (Next.js 15 requirement)

### `src/app/explore/page.tsx` + `ExploreClient.tsx` *(new)*
- Search bar with clear button
- 16 trending tag chips (click to filter)
- Search hits `/api/search` and shows results in `<VideoGrid>`
- Split into Server (`page.tsx`) + Client (`ExploreClient.tsx`) to satisfy Next.js `useSearchParams` Suspense requirement

### `src/app/upload/page.tsx` *(new)*
- Server component — redirects to `/sign-in` if not authenticated
- Renders `<UploadForm />`

### `src/app/profile/[userId]/page.tsx` + `ProfileClient.tsx` *(new)*
- Server component fetches user + `isFollowing` state
- Client component handles Videos / Saved tabs with shimmer loading
- Follow/unfollow with optimistic update
- Shows video/follower/following counts
- Owner sees Clerk UserButton; others see Follow button

### `src/app/saved/page.tsx` *(new)*
- Server component — auth required
- Fetches saved videos server-side via Prisma
- Renders `<VideoGrid>`

### `src/app/video/[id]/page.tsx` *(new)*
- Server component — fetches video + user interaction state
- Feeds into `<VideoFeed initialVideos={[video]}>` for seamless experience

### `src/app/sign-in/[[...sign-in]]/page.tsx` *(new)*
### `src/app/sign-up/[[...sign-up]]/page.tsx` *(new)*
Clerk catch-all auth pages, centered on black background.

---

## 7. Config Updates

### `src/middleware.ts` *(new — correct location)*
The original `src/app/middleware.ts` was in the wrong location (Next.js ignores it there).
Created at `src/middleware.ts` with public routes:
`/`, `/explore/**`, `/video/**`, `/profile/**`, `/sign-in/**`, `/sign-up/**`, read-only API routes.

### `next.config.ts` *(updated)*
- Added `images.remotePatterns` for Clerk, S3, and sample video CDN
- Changed `experimental.serverComponentsExternalPackages` → `serverExternalPackages` (Next.js 15)

### `src/app/globals.css` *(new — was at wrong path)*
- Dark theme CSS variables
- Scrollbar hidden globally
- Safe area utilities for notched mobile devices
- Shimmer loading animation
- Heart burst animation keyframes

### `.env.local` *(updated)*
Added `DATABASE_URL=file:./dev.db` for Prisma SQLite.

### `package.json` *(updated)*
Added scripts: `seed`, `db:push`, `db:studio`
Added `prisma.seed` config for `npx prisma db seed`.

---

## 8. Files Removed / Cleaned Up

| File | Reason |
|------|--------|
| `src/app/pages/sign-in.tsx` | Replaced by App Router `sign-in/[[...sign-in]]/page.tsx` |
| `src/app/pages/sign-up.tsx` | Replaced by App Router `sign-up/[[...sign-up]]/page.tsx` |
| `src/app/pages/upload.tsx` | Replaced by App Router `upload/page.tsx` |
| `src/app/api/upload-video/route.ts` | Replaced by `/api/upload/route.ts` (re-exports it) |

---

## 9. Known / Expected Behaviors

- **Clerk keys:** `.env.local` contains placeholder values. Replace with real keys from
  [clerk.com/dashboard](https://dashboard.clerk.com) before the app will function.
- **S3:** Optional. Without `AWS_ACCESS_KEY_ID` / `S3_BUCKET_NAME`, videos save to `public/uploads/`.
- **Google Vision:** Optional. Without `GOOGLE_APPLICATION_CREDENTIALS`, moderation is skipped (fail-open).
- **Weaviate:** Existing Weaviate client packages remain in `package.json` but the recommendation
  engine now uses a pure SQLite-based scoring algorithm — no Weaviate instance required.
- **`<img>` warnings:** ESLint warns about using `<img>` vs Next.js `<Image>`. These are warnings only
  (not errors) and safe to ignore for avatar/thumbnail images from dynamic URLs.

---

## 10. Bug Fix — `safeAuth()` (post-initial-build)

**Problem:** Clerk's `auth()` throws an exception (instead of returning `{ userId: null }`) when
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` contains a placeholder value. This crashed every API route on
startup, returning `{"error":"Failed to fetch ..."}` for all requests including public ones.

**Fix:** Added `safeAuth()` to `src/lib/auth.ts`:
```ts
export async function safeAuth(): Promise<{ userId: string | null }> {
  try { return await auth(); }
  catch { return { userId: null }; }
}
```

Replaced all 12 direct `auth()` / `import { auth }` calls across every API route file with
`safeAuth()` from `@/lib/auth`. Public endpoints (recommendations, videos, search) now work
without any Clerk keys configured; write endpoints (like, comment, upload) return a clean 401.

**Files changed:** All files under `src/app/api/` plus `src/lib/auth.ts`.

---

## 11. Landing Page + App Shell Refactor (post-initial-build)

### New: `src/app/page.tsx` — Landing Page
Full marketing landing page shown at `/` before users enter the app. Sections:
- **Navbar** — Logo, Sign In / Sign Up (or "Go to Feed" if already signed in)
- **Hero** — Animated gradient blobs, large headline with gradient text, phone mockup with a
  live looping video, floating stat cards (Likes / Comments / Saved), social proof numbers
- **Features** — 6 cards: Endless Feed, Smart Recommendations, Instant Upload, Like/Save/Share,
  Live Comments, Content Moderation
- **How It Works** — 3-step numbered guide
- **Video Showcase Strip** — Horizontally scrollable thumbnail strip of 5 demo videos with
  hover-play overlays
- **CTA Banner** — Gradient pink/rose section with sign-up + browse buttons
- **Footer** — Logo + nav links

### New: `src/app/feed/page.tsx`
The main video feed moved from `/` to `/feed` so the landing page can live at root.

### New: `src/app/components/AppShell.tsx`
Client component that conditionally renders `<Sidebar>` and `<BottomNav>` based on the current
route. Pages `/`, `/sign-in/**`, and `/sign-up/**` are "shell-free" (they manage their own layout).
All other routes get the sidebar + bottom nav as before.

### Updated: `src/app/layout.tsx`
Now renders `<AppShell>` instead of inline sidebar/bottomnav, so the landing page is clean.

### Updated: `src/app/components/Sidebar.tsx` + `BottomNav.tsx`
Home link changed from `/` → `/feed`.

### Updated: `src/middleware.ts`
Added `/feed(.*)` to the public routes list.

### Updated: `src/app/globals.css`
Added `@keyframes floatY` used by the floating stat cards on the landing page hero.

---

## How to Run

```bash
# 1. Add real Clerk keys to .env.local
# 2. Start dev server
npm run dev

# Routes:
#   /        → Landing page (public)
#   /feed    → Main video feed (public, auth enhances recommendations)
#   /explore → Search + trending tags
#   /upload  → Upload a video (requires auth)
#   /profile/[userId] → User profile
#   /saved   → Saved videos (requires auth)

# Optional: seed fresh demo data
npm run seed

# Optional: open Prisma Studio to inspect the database
npm run db:studio
```
