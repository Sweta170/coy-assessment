import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { initDb, seedDatabase } from '../lib/db';
import {
  processSwipe,
  getFeed,
  getMatches,
  SelfSwipeError,
  TargetNotFoundError,
} from '../lib/matching/service';
import { INBOUND_LIKES, INBOUND_PASSES } from '../lib/db/seed-data';

describe('Coy Matching Logic - Unit Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    // Isolated in-memory database for every test
    db = new Database(':memory:');
    initDb(db);
  });

  afterEach(() => {
    db.close();
  });

  it('creates a match when like is mutual', () => {
    // user_01 has already swiped "like" on "me" (from INBOUND_LIKES)
    const targetId = INBOUND_LIKES[0]; // 'user_01'
    const result = processSwipe(db, targetId, 'like');

    expect(result.matched).toBe(true);
    if (result.matched) {
      expect(result.profile.id).toBe(targetId);
      expect(result.profile.name).toBe('Maya Lin');
      // Ensure only public fields are included
      expect(result.profile).toHaveProperty('id');
      expect(result.profile).toHaveProperty('name');
      expect(result.profile).toHaveProperty('age');
      expect(result.profile).toHaveProperty('photo');
      expect(result.profile).toHaveProperty('bio');
      expect(result.profile).toHaveProperty('city');
      expect(result.profile).toHaveProperty('interests');
    }

    // Check matches table directly
    const matches = getMatches(db);
    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe(targetId);
  });

  it('does NOT create a match for a one-sided like', () => {
    // user_03 has not swiped on me yet
    const targetId = 'user_03';
    const result = processSwipe(db, targetId, 'like');

    expect(result.matched).toBe(false);
    expect(result).toEqual({ matched: false });

    // No matches created
    const matches = getMatches(db);
    expect(matches.length).toBe(0);
  });

  it('does NOT create a match when target already passed on me', () => {
    // user_02 passed on me (from INBOUND_PASSES)
    const targetId = INBOUND_PASSES[0]; // 'user_02'
    const result = processSwipe(db, targetId, 'like');

    expect(result.matched).toBe(false);
    expect(result).toEqual({ matched: false });

    const matches = getMatches(db);
    expect(matches.length).toBe(0);
  });

  it('pass blocks match even if target already liked me', () => {
    // user_04 already liked me
    const targetId = INBOUND_LIKES[1]; // 'user_04'
    const result = processSwipe(db, targetId, 'pass');

    expect(result.matched).toBe(false);
    expect(result).toEqual({ matched: false });

    const matches = getMatches(db);
    expect(matches.length).toBe(0);
  });

  it('pass is final: pass-by-me then they-liked-me must never produce a match', () => {
    // user_05 has not swiped on me yet
    const targetId = 'user_05';

    // Step 1: I pass on user_05
    const myFirstSwipe = processSwipe(db, targetId, 'pass', 'me');
    expect(myFirstSwipe.matched).toBe(false);

    // Step 2: Later, user_05 swipes "like" on me
    // (user_05's swipe shouldn't produce a match because my swipe was pass)
    const theirSwipe = processSwipe(db, 'me', 'like', targetId);
    expect(theirSwipe.matched).toBe(false);

    // Step 3: Verify no match exists
    const matches = getMatches(db, 'me');
    expect(matches.length).toBe(0);

    // Step 4: If I try to swipe "like" on user_05 later, idempotency keeps the original pass
    const mySecondSwipe = processSwipe(db, targetId, 'like', 'me');
    expect(mySecondSwipe.matched).toBe(false);
    expect(getMatches(db, 'me').length).toBe(0);
  });

  it('is strictly idempotent on re-swiping the same target', () => {
    const targetId = INBOUND_LIKES[2]; // 'user_07', already liked me

    // First like -> Match
    const firstSwipe = processSwipe(db, targetId, 'like');
    expect(firstSwipe.matched).toBe(true);

    // Second like -> returns the existing match without creating duplicate rows
    const secondSwipe = processSwipe(db, targetId, 'like');
    expect(secondSwipe.matched).toBe(true);

    // Third swipe with "pass" -> decision cannot be changed, returns existing match
    const thirdSwipe = processSwipe(db, targetId, 'pass');
    expect(thirdSwipe.matched).toBe(true);

    // Verify database has exactly 1 swipe and 1 match
    const swipesCount = db.prepare('SELECT COUNT(*) as count FROM swipes WHERE swiper_id = ? AND target_id = ?')
      .get('me', targetId) as { count: number };
    expect(swipesCount.count).toBe(1);

    const matchCount = db.prepare('SELECT COUNT(*) as count FROM matches').get() as { count: number };
    expect(matchCount.count).toBe(1);
  });

  it('rejects self-swipe', () => {
    expect(() => {
      processSwipe(db, 'me', 'like');
    }).toThrow(SelfSwipeError);
  });

  it('rejects invalid/unknown target', () => {
    expect(() => {
      processSwipe(db, 'non_existent_user_id', 'like');
    }).toThrow(TargetNotFoundError);
  });

  it('feed never returns already-swiped profiles or matched profiles', () => {
    const initialFeed = getFeed(db);
    const initialCount = initialFeed.length;
    expect(initialCount).toBeGreaterThan(0);

    // Swipe on the first profile
    const firstProfile = initialFeed[0];
    processSwipe(db, firstProfile.id, 'like');

    // Swipe on the second profile
    const secondProfile = initialFeed[1];
    processSwipe(db, secondProfile.id, 'pass');

    // Feed should no longer contain either
    const newFeed = getFeed(db);
    expect(newFeed.length).toBe(initialCount - 2);
    expect(newFeed.some((p) => p.id === firstProfile.id)).toBe(false);
    expect(newFeed.some((p) => p.id === secondProfile.id)).toBe(false);
  });
});
