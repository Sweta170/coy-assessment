import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { NextRequest } from 'next/server';
import { initDb, seedDatabase } from '../lib/db';
import { GET as getFeedHandler } from '../app/api/feed/route';
import { POST as swipeHandler } from '../app/api/swipe/route';
import { GET as getMatchesHandler } from '../app/api/matches/route';
import { INBOUND_LIKES, INBOUND_PASSES } from '../lib/db/seed-data';

// Helper to construct NextRequest for POST
function createSwipeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/swipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('Coy Privacy Rules & API Verification', () => {
  let db: Database.Database;

  beforeEach(() => {
    // Reset global db to an in-memory db for clean isolation
    db = new Database(':memory:');
    initDb(db);
    globalThis._coy_db = db;
  });

  afterEach(() => {
    db.close();
    globalThis._coy_db = undefined;
  });

  it('Privacy Rule 1: No API response, field, header, or error message reveals who liked me', async () => {
    // 1. Check Feed response
    const feedRes = await getFeedHandler();
    expect(feedRes.status).toBe(200);
    const feed = await feedRes.json();

    expect(Array.isArray(feed)).toBe(true);
    expect(feed.length).toBeGreaterThan(0);

    const allowedPublicFields = new Set(['id', 'name', 'age', 'photo', 'bio', 'city', 'interests']);

    for (const profile of feed) {
      const keys = Object.keys(profile);
      for (const key of keys) {
        expect(allowedPublicFields.has(key)).toBe(true);
      }
      // Ensure private fields never exist
      expect(profile).not.toHaveProperty('direction');
      expect(profile).not.toHaveProperty('swiper_id');
      expect(profile).not.toHaveProperty('hasLikedMe');
      expect(profile).not.toHaveProperty('likedMe');
      expect(profile).not.toHaveProperty('inbound');
      expect(profile).not.toHaveProperty('swipe_direction');
    }

    // Check headers for any info leak
    const feedHeaders = feedRes.headers;
    expect(feedHeaders.get('x-likes-count')).toBeNull();
    expect(feedHeaders.get('x-matches-count')).toBeNull();
  });

  it('Privacy Rule 2: A "pass" response is identical in shape to a non-matching "like" response', async () => {
    // Target A: someone who liked me (INBOUND_LIKES[0])
    // Target B: someone who passed on me (INBOUND_PASSES[0])
    // Target C: someone who has not swiped on me ('user_03')

    // Scenario 1: Swiping "pass" on someone who liked me
    const passOnLikerReq = createSwipeRequest({
      targetId: INBOUND_LIKES[0],
      direction: 'pass',
    });
    const passOnLikerRes = await swipeHandler(passOnLikerReq);
    expect(passOnLikerRes.status).toBe(200);
    const passOnLikerJson = await passOnLikerRes.json();

    // Scenario 2: Swiping "pass" on someone who has not swiped on me
    const passOnNeutralReq = createSwipeRequest({
      targetId: 'user_03',
      direction: 'pass',
    });
    const passOnNeutralRes = await swipeHandler(passOnNeutralReq);
    expect(passOnNeutralRes.status).toBe(200);
    const passOnNeutralJson = await passOnNeutralRes.json();

    // Scenario 3: Swiping "like" on someone who has NOT swiped on me
    const likeOnNeutralReq = createSwipeRequest({
      targetId: 'user_05',
      direction: 'like',
    });
    const likeOnNeutralRes = await swipeHandler(likeOnNeutralReq);
    expect(likeOnNeutralRes.status).toBe(200);
    const likeOnNeutralJson = await likeOnNeutralRes.json();

    // Scenario 4: Swiping "like" on someone who PASSED on me
    const likeOnPasserReq = createSwipeRequest({
      targetId: INBOUND_PASSES[0],
      direction: 'like',
    });
    const likeOnPasserRes = await swipeHandler(likeOnPasserReq);
    expect(likeOnPasserRes.status).toBe(200);
    const likeOnPasserJson = await likeOnPasserRes.json();

    // All four must be strictly identical in shape and content: { matched: false }
    expect(passOnLikerJson).toEqual({ matched: false });
    expect(passOnNeutralJson).toEqual({ matched: false });
    expect(likeOnNeutralJson).toEqual({ matched: false });
    expect(likeOnPasserJson).toEqual({ matched: false });

    // Ensure no secret keys exist in any of them
    expect(Object.keys(passOnLikerJson)).toEqual(['matched']);
    expect(Object.keys(passOnNeutralJson)).toEqual(['matched']);
    expect(Object.keys(likeOnNeutralJson)).toEqual(['matched']);
    expect(Object.keys(likeOnPasserJson)).toEqual(['matched']);
  });

  it('Privacy Rule 3: Feed never includes already-swiped profiles or matched profiles', async () => {
    const feedRes1 = await getFeedHandler();
    const initialFeed = await feedRes1.json();
    const initialCount = initialFeed.length;

    const targetToLike = INBOUND_LIKES[1]; // Will match
    const targetToPass = 'user_06'; // Will not match

    // Perform swipe 1 (Match)
    await swipeHandler(createSwipeRequest({ targetId: targetToLike, direction: 'like' }));
    // Perform swipe 2 (Pass)
    await swipeHandler(createSwipeRequest({ targetId: targetToPass, direction: 'pass' }));

    // Fetch feed again
    const feedRes2 = await getFeedHandler();
    const updatedFeed = await feedRes2.json();

    expect(updatedFeed.length).toBe(initialCount - 2);
    expect(updatedFeed.some((p: { id: string }) => p.id === targetToLike)).toBe(false);
    expect(updatedFeed.some((p: { id: string }) => p.id === targetToPass)).toBe(false);
  });

  it('Privacy Rule 4: Swiping twice on the same profile cannot be used to probe whether they liked me', async () => {
    // Suppose I passed on someone who liked me (INBOUND_LIKES[0])
    const likerTarget = INBOUND_LIKES[0];

    // First swipe: Pass
    const swipe1 = await swipeHandler(createSwipeRequest({ targetId: likerTarget, direction: 'pass' }));
    expect(await swipe1.json()).toEqual({ matched: false });

    // Attacker tries to "probe" whether target liked them by swiping "like" now
    const swipe2 = await swipeHandler(createSwipeRequest({ targetId: likerTarget, direction: 'like' }));
    const result2 = await swipe2.json();

    // Must still return { matched: false }! No match created, no leak!
    expect(result2).toEqual({ matched: false });

    // Compare with someone who never liked me
    const neutralTarget = 'user_09';
    await swipeHandler(createSwipeRequest({ targetId: neutralTarget, direction: 'pass' }));
    const probeNeutral = await swipeHandler(createSwipeRequest({ targetId: neutralTarget, direction: 'like' }));
    const probeNeutralResult = await probeNeutral.json();

    expect(probeNeutralResult).toEqual({ matched: false });
    // The probe result is indistinguishable
    expect(result2).toEqual(probeNeutralResult);
  });

  it('Privacy Rule 5: Pass-by-me then they-liked-me must never produce a match (pass is final)', async () => {
    const candidateId = 'user_11';

    // 1. "me" passes on user_11
    const myPass = await swipeHandler(createSwipeRequest({ targetId: candidateId, direction: 'pass' }));
    expect(await myPass.json()).toEqual({ matched: false });

    // 2. Later, user_11 likes "me" in database
    db.prepare('INSERT INTO swipes (swiper_id, target_id, direction) VALUES (?, ?, ?)')
      .run(candidateId, 'me', 'like');

    // 3. Check matches API - must be empty
    const matchesRes = await getMatchesHandler();
    const matches = await matchesRes.json();
    expect(matches.length).toBe(0);

    // 4. If "me" tries to swipe like later, it is rejected/ignored by idempotency
    const myLateLike = await swipeHandler(createSwipeRequest({ targetId: candidateId, direction: 'like' }));
    expect(await myLateLike.json()).toEqual({ matched: false });

    const finalMatchesRes = await getMatchesHandler();
    const finalMatches = await finalMatchesRes.json();
    expect(finalMatches.length).toBe(0);
  });

  it('Validates input and handles bad requests cleanly', async () => {
    // Invalid JSON / missing fields
    const res1 = await swipeHandler(createSwipeRequest({ targetId: 'user_01' }));
    expect(res1.status).toBe(400);

    // Invalid direction
    const res2 = await swipeHandler(createSwipeRequest({ targetId: 'user_01', direction: 'superlike' }));
    expect(res2.status).toBe(400);

    // Self-swipe
    const res3 = await swipeHandler(createSwipeRequest({ targetId: 'me', direction: 'like' }));
    expect(res3.status).toBe(400);
    const selfJson = await res3.json();
    expect(selfJson.error).toContain('own profile');

    // Unknown target
    const res4 = await swipeHandler(createSwipeRequest({ targetId: 'does_not_exist', direction: 'like' }));
    expect(res4.status).toBe(404);
  });

  it('Matches API returns mutual matches in newest-first order', async () => {
    // Match with user_01
    await swipeHandler(createSwipeRequest({ targetId: INBOUND_LIKES[0], direction: 'like' }));
    // Match with user_04
    await swipeHandler(createSwipeRequest({ targetId: INBOUND_LIKES[1], direction: 'like' }));

    const res = await getMatchesHandler();
    expect(res.status).toBe(200);
    const matches = await res.json();

    expect(matches.length).toBe(2);
    // Newest match first
    expect(matches[0].id).toBe(INBOUND_LIKES[1]);
    expect(matches[1].id).toBe(INBOUND_LIKES[0]);
    expect(matches[0]).toHaveProperty('matchedAt');
  });
});
