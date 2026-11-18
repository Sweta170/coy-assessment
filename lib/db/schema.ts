export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  interests: string[];
  created_at?: string;
}

export interface ProfileRow {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  interests: string; // JSON string in SQLite
  created_at?: string;
}

export type SwipeDirection = 'like' | 'pass';

export interface SwipeRow {
  id: number;
  swiper_id: string;
  target_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface MatchRow {
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  photo TEXT NOT NULL,
  bio TEXT NOT NULL,
  city TEXT NOT NULL,
  interests TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS swipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  swiper_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('like', 'pass')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(swiper_id, target_id),
  FOREIGN KEY (swiper_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  created_at DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
  PRIMARY KEY (user1_id, user2_id),
  CHECK(user1_id < user2_id),
  FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON swipes(target_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
`;
