import Database from 'better-sqlite3';
import { USER_ID } from '../db';
import { ProfileRow } from '../db/schema';
import { MatchItem, PublicProfile, SwipeResponse } from './validation';

export class MatchingError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'MatchingError';
  }
}

export class TargetNotFoundError extends MatchingError {
  constructor(targetId: string) {
    super(`Target profile '${targetId}' not found`, 404);
    this.name = 'TargetNotFoundError';
  }
}

export class SelfSwipeError extends MatchingError {
  constructor() {
    super('Cannot swipe on your own profile', 400);
    this.name = 'SelfSwipeError';
  }
}

/**
 * Format a database row into a sanitized public profile.
 * Guarantees no private internal flags (swipes, directions, timestamps) leak.
 */
export function toPublicProfile(row: ProfileRow): PublicProfile {
  let interests: string[] = [];
  try {
    interests = JSON.parse(row.interests);
  } catch {
    interests = [];
  }

  return {
    id: row.id,
    name: row.name,
    age: row.age,
    photo: row.photo,
    bio: row.bio,
    city: row.city,
    interests,
  };
}

/**
 * Modern Fisher-Yates shuffle to ensure completely unbiased and unpredictable profile order.
 * Profiles that liked the current user will never be clustered or ordered predictably.
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get feed of profiles that current user has not swiped on yet.
 * Never includes already-swiped or matched profiles.
 * Responses contain strictly public profile fields.
 */
export function getFeed(db: Database.Database, currentUserId: string = USER_ID): PublicProfile[] {
  const stmt = db.prepare(`
    SELECT id, name, age, photo, bio, city, interests
    FROM profiles
    WHERE id != ?
      AND id NOT IN (
        SELECT target_id FROM swipes WHERE swiper_id = ?
      )
  `);

  const rows = stmt.all(currentUserId, currentUserId) as ProfileRow[];
  const publicProfiles = rows.map(toPublicProfile);

  return shuffleArray(publicProfiles);
}

/**
 * Helper to get the canonical ordered pair for matches
 */
export function getOrderedPair(userA: string, userB: string): [string, string] {
  return userA < userB ? [userA, userB] : [userB, userA];
}

/**
 * Process a swipe action.
 * Enforces Coy's core privacy promise:
 * - Reject unknown targets & self-swipe
 * - Idempotent: re-swiping does not duplicate or alter original decision
 * - Mutual like creates a match and returns { matched: true, profile }
 * - Any pass or non-mutual like returns strictly { matched: false }
 */
export function processSwipe(
  db: Database.Database,
  targetId: string,
  direction: 'like' | 'pass',
  currentUserId: string = USER_ID
): SwipeResponse {
  // 1. Reject self-swipe
  if (targetId === currentUserId) {
    throw new SelfSwipeError();
  }

  // 2. Validate target existence
  const targetRow = db.prepare('SELECT * FROM profiles WHERE id = ?').get(targetId) as ProfileRow | undefined;
  if (!targetRow) {
    throw new TargetNotFoundError(targetId);
  }

  const [user1, user2] = getOrderedPair(currentUserId, targetId);

  // 3. Check for existing swipe (Idempotency check)
  const existingSwipe = db.prepare(`
    SELECT direction FROM swipes WHERE swiper_id = ? AND target_id = ?
  `).get(currentUserId, targetId) as { direction: 'like' | 'pass' } | undefined;

  if (existingSwipe) {
    // If user already swiped, return the existing result without changing anything
    const existingMatch = db.prepare(`
      SELECT 1 FROM matches WHERE user1_id = ? AND user2_id = ?
    `).get(user1, user2);

    if (existingMatch) {
      return {
        matched: true,
        profile: toPublicProfile(targetRow),
      };
    }

    return { matched: false };
  }

  // 4. Record swipe in an atomic transaction
  const executeSwipe = db.transaction((): SwipeResponse => {
    // Insert current user's swipe
    db.prepare(`
      INSERT INTO swipes (swiper_id, target_id, direction)
      VALUES (?, ?, ?)
    `).run(currentUserId, targetId, direction);

    // If direction is 'like', check if target has already liked current user
    if (direction === 'like') {
      const inboundSwipe = db.prepare(`
        SELECT direction FROM swipes WHERE swiper_id = ? AND target_id = ?
      `).get(targetId, currentUserId) as { direction: string } | undefined;

      if (inboundSwipe && inboundSwipe.direction === 'like') {
        // Mutual like! Record match
        db.prepare(`
          INSERT OR IGNORE INTO matches (user1_id, user2_id)
          VALUES (?, ?)
        `).run(user1, user2);

        return {
          matched: true,
          profile: toPublicProfile(targetRow),
        };
      }
    }

    // Default: Return { matched: false } and nothing else
    return { matched: false };
  });

  return executeSwipe();
}

/**
 * Get all mutual matches for current user, ordered newest first.
 */
export function getMatches(db: Database.Database, currentUserId: string = USER_ID): MatchItem[] {
  const stmt = db.prepare(`
    SELECT
      p.id, p.name, p.age, p.photo, p.bio, p.city, p.interests,
      m.created_at as matched_at
    FROM matches m
    JOIN profiles p ON (
      CASE
        WHEN m.user1_id = ? THEN m.user2_id
        ELSE m.user1_id
      END = p.id
    )
    WHERE m.user1_id = ? OR m.user2_id = ?
    ORDER BY m.created_at DESC, m.rowid DESC
  `);

  const rows = stmt.all(currentUserId, currentUserId, currentUserId) as (ProfileRow & { matched_at: string })[];

  return rows.map((row) => ({
    ...toPublicProfile(row),
    matchedAt: row.matched_at,
  }));
}
