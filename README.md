# Coy — Privacy-First Dating

> **Core Promise**: *Nobody ever learns who liked them unless the like is mutual.*  
> Every architectural and design decision in Coy is built to strictly protect that promise.

---

## 🌟 Overview

Coy is a standalone, mobile-first "Discover" swipe application for a privacy-first dating platform. Unlike conventional dating apps that monetize curiosity through "See who liked you" features or leak inbound interest through subtle API metadata, Coy enforces strict zero-knowledge discovery:

1. Inbound likes are never exposed via flags, counts, ordering, or API responses.
2. A "pass" response is byte-for-byte identical in shape to a non-matching "like" response (`{ "matched": false }`).
3. Re-swiping can never be leveraged as a probe to deduce another user's preference.
4. If a user passes on someone, that pass is immutable and final — even if the other person later swipes right.

---

## 📐 Architecture & Folder Structure

The project is structured into modular layers adhering to clean separation of concerns:

```
coy/
├── app/
│   ├── api/
│   │   ├── feed/route.ts        # GET /api/feed (sanitized public profiles, randomized)
│   │   ├── swipe/route.ts       # POST /api/swipe (idempotent, mutual matching)
│   │   ├── matches/route.ts     # GET /api/matches (mutual matches only, newest first)
│   │   └── reset/route.ts       # POST /api/reset (demo reset & re-seed)
│   ├── globals.css              # Dark theme styling, glassmorphism, shimmer effects
│   ├── layout.tsx               # Root layout, mobile viewport meta, fonts
│   └── page.tsx                 # Main entry point mounting AppShell
├── components/
│   ├── layout/
│   │   └── AppShell.tsx         # Bottom tab bar ("Home" blank placeholder vs "Discover")
│   ├── discover/
│   │   ├── DiscoverView.tsx     # Sub-view container: "Swipe Deck" & "Matches"
│   │   ├── CardStack.tsx        # Card deck coordinator, stack hint, prefetch, keyboard navigation
│   │   ├── SwipeCard.tsx        # Framer-motion interactive drag card with dynamic stamps
│   │   ├── MatchOverlay.tsx     # Full-screen "It's a Match!" celebration modal (both photos)
│   │   ├── MatchesList.tsx      # Grid of mutual matches with match timestamps and empty states
│   │   └── ProfileDetailModal.tsx # Detailed profile modal (bio, interests, location)
│   └── ui/
│       └── Toast.tsx            # Rollback & notification toast container
├── lib/
│   ├── db/
│   │   ├── index.ts             # SQLite connection (better-sqlite3, WAL mode, auto-seeding)
│   │   ├── schema.ts            # DDL, indexes, and type definitions
│   │   ├── seed-data.ts         # 38 mock profiles, ~9 inbound likes, ~5 inbound passes
│   │   ├── seed.ts              # CLI seed script
│   │   └── reset.ts             # CLI reset database script
│   └── matching/
│       ├── service.ts           # Core matching engine & privacy enforcement logic
│       └── validation.ts        # Zod request/response validation schemas
├── tests/
│   ├── matching-unit.test.ts    # Unit tests for matching rules and constraints
│   └── privacy-api.test.ts      # API-level privacy verification & leak inspection
├── coy.db                       # Auto-generated SQLite database (git-ignored)
├── package.json                 # Dependencies and npm scripts
└── vitest.config.ts             # Vitest test runner configuration
```

---

## 🗄️ Database Schema

The database runs on SQLite via `better-sqlite3` with Write-Ahead Logging (`WAL`) and foreign keys enabled.

### 1. `profiles`
Contains user profiles. Assumes a hardcoded logged-in user with `id = 'me'`.
```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  photo TEXT NOT NULL,
  bio TEXT NOT NULL,
  city TEXT NOT NULL,
  interests TEXT NOT NULL, -- JSON array of strings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `swipes`
Tracks directional swipe actions.
```sql
CREATE TABLE swipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  swiper_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('like', 'pass')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(swiper_id, target_id),
  FOREIGN KEY (swiper_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES profiles(id) ON DELETE CASCADE
);
```

### 3. `matches`
Stores confirmed mutual matches using an ordered pair `(min(user1, user2), max(user1, user2))` to prevent duplicate rows.
```sql
CREATE TABLE matches (
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  created_at DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
  PRIMARY KEY (user1_id, user2_id),
  CHECK(user1_id < user2_id),
  FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE
);
```

---

## 🔒 Privacy Rules & Edge Cases Handled

| Rule | Enforcement Strategy |
|---|---|
| **1. No Information Leaks** | `/api/feed` projects only sanitized public fields (`id, name, age, photo, bio, city, interests`). Internal fields (`direction`, `swiper_id`, timestamps, like indicators) are never returned. Headers never contain like counts. Feed order is shuffled with Fisher-Yates randomness so inbound likes are never clustered or predictable. |
| **2. Identical Response Shapes** | Any non-matching swipe returns strictly `{ "matched": false }`. A "pass" on someone who liked you, a "like" on someone who hasn't swiped, or a "like" on someone who passed all return the exact same payload. |
| **3. Feed Isolation** | Feed queries strictly filter out all candidates where `id = 'me'` or `id IN (SELECT target_id FROM swipes WHERE swiper_id = 'me')`. Already swiped and matched users can never reappear in the feed. |
| **4. Anti-Probing Idempotency** | If a user tries to probe whether target X liked them by swiping "pass" first and then sending "like", the database idempotency check detects the existing swipe and returns the original outcome (`{ "matched": false }`). |
| **5. Pass Is Final** | If user A passes on user B, and user B later likes user A, user B's swipe will check user A's recorded swipe, see `'pass'`, and refuse to create a match. A pass can never be overwritten into a match. |

---

## 📡 API Reference

### `GET /api/feed`
Retrieves profiles that `"me"` has not yet swiped on.
- **Query / Headers**: None required (`Cache-Control: no-store`).
- **Response**: `200 OK`
```json
[
  {
    "id": "user_01",
    "name": "Maya Lin",
    "age": 23,
    "photo": "https://i.pravatar.cc/600?img=1",
    "bio": "Landscape architect in training...",
    "city": "UC Berkeley",
    "interests": ["Plants", "Urbanism", "Sketching"]
  }
]
```

### `POST /api/swipe`
Records a swipe decision and checks for a mutual match in an atomic transaction.
- **Request Body**:
```json
{
  "targetId": "user_01",
  "direction": "like" // or "pass"
}
```
- **Response (Match)**: `200 OK`
```json
{
  "matched": true,
  "profile": {
    "id": "user_01",
    "name": "Maya Lin",
    "age": 23,
    "photo": "https://i.pravatar.cc/600?img=1",
    "bio": "Landscape architect in training...",
    "city": "UC Berkeley",
    "interests": ["Plants", "Urbanism", "Sketching"]
  }
}
```
- **Response (No Match or Pass)**: `200 OK`
```json
{
  "matched": false
}
```
- **Errors**:
  - `400 Bad Request`: Invalid payload or self-swipe (`{ "error": "Cannot swipe on your own profile" }`).
  - `404 Not Found`: Target profile does not exist.

### `GET /api/matches`
Returns confirmed mutual matches involving `"me"`, newest first.
- **Response**: `200 OK`
```json
[
  {
    "id": "user_01",
    "name": "Maya Lin",
    "age": 23,
    "photo": "https://i.pravatar.cc/600?img=1",
    "bio": "Landscape architect in training...",
    "city": "UC Berkeley",
    "interests": ["Plants", "Urbanism", "Sketching"],
    "matchedAt": "2026-11-18 07:35:12.123"
  }
]
```

### `POST /api/reset`
Resets the database and re-seeds with fresh initial profiles and mock inbound likes/passes.
- **Response**: `200 OK` `{ "success": true }`

---

## 📱 Frontend UX Highlights

- **Visible Stack Hint**: The card underneath the active top card is rendered in the background with scaling (`scale: 0.95`, `y: 12`) to give depth.
- **Smooth Framer-Motion Gestures**: Touch/mouse drag with rotation physics and responsive "LIKE" / "PASS" stamps that fade in proportionally to drag displacement.
- **Desktop Navigation**: Full arrow-key controls (`←` Pass, `→` Like) and accessible button controls.
- **Image Prefetching**: Automatically preloads the top 3 upcoming card images in the background so card transitions never flash blank.
- **Optimistic UI with Rollback**: Top card animates out instantly; if the server fails or network drops, the card is rolled back onto the deck with an alert toast.
- **"It's a Match!" Overlay**: Celebratory full-screen view displaying both user photos, an interlocking heart connection, and options to "Keep Swiping" or "View Matches".
- **Empty States & Skeletons**: Polished card skeleton shimmer while loading, and an empty deck state with a one-click database reset button for demonstrations.

---

## 🚀 Setup & Running

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run the Development Server
Starts the Next.js local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. (The database file `coy.db` will be auto-created and seeded on first run).

### 3. Run Tests
Runs the Vitest test suite covering unit logic and all privacy rules:
```bash
npm test
```

### 4. Database Scripts
- **Re-seed database**:
  ```bash
  npm run seed
  ```
- **Reset and re-seed database**:
  ```bash
  npm run reset-db
  ```
