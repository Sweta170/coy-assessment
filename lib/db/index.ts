import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { CREATE_TABLES_SQL, Profile } from './schema';
import { CURRENT_USER, MOCK_PROFILES, INBOUND_LIKES, INBOUND_PASSES } from './seed-data';

export const USER_ID = 'me';

const DB_FILENAME = 'coy.db';

declare global {
  // eslint-disable-next-line no-var
  var _coy_db: Database.Database | undefined;
}

export function getDbPath(): string {
  if (process.env.COY_DB_PATH) {
    return process.env.COY_DB_PATH;
  }
  return path.join(process.cwd(), DB_FILENAME);
}

export function initDb(db: Database.Database): void {
  // Enable foreign keys and WAL mode for better concurrency and integrity
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables and indexes
  db.exec(CREATE_TABLES_SQL);

  // Check if profiles are already seeded
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
  if (profileCount.count === 0) {
    seedDatabase(db);
  }
}

export function seedDatabase(db: Database.Database): void {
  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO profiles (id, name, age, photo, bio, city, interests)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSwipe = db.prepare(`
    INSERT OR REPLACE INTO swipes (swiper_id, target_id, direction)
    VALUES (?, ?, ?)
  `);

  const runSeed = db.transaction(() => {
    // 1. Insert "me" profile
    insertProfile.run(
      CURRENT_USER.id,
      CURRENT_USER.name,
      CURRENT_USER.age,
      CURRENT_USER.photo,
      CURRENT_USER.bio,
      CURRENT_USER.city,
      JSON.stringify(CURRENT_USER.interests)
    );

    // 2. Insert mock profiles (at least 36)
    for (const p of MOCK_PROFILES) {
      insertProfile.run(
        p.id,
        p.name,
        p.age,
        p.photo,
        p.bio,
        p.city,
        JSON.stringify(p.interests)
      );
    }

    // 3. Insert inbound likes (~8-10 profiles swiped "like" on "me")
    for (const targetId of INBOUND_LIKES) {
      insertSwipe.run(targetId, USER_ID, 'like');
    }

    // 4. Insert inbound passes (~4-5 profiles swiped "pass" on "me")
    for (const targetId of INBOUND_PASSES) {
      insertSwipe.run(targetId, USER_ID, 'pass');
    }
  });

  runSeed();
}

export function getDb(overridePath?: string): Database.Database {
  if (overridePath) {
    const db = new Database(overridePath);
    initDb(db);
    return db;
  }

  if (globalThis._coy_db) {
    return globalThis._coy_db;
  }

  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  initDb(db);

  if (process.env.NODE_ENV !== 'production') {
    globalThis._coy_db = db;
  }

  return db;
}

export function resetDatabase(db?: Database.Database): void {
  const targetDb = db || getDb();
  targetDb.exec(`
    DELETE FROM matches;
    DELETE FROM swipes;
    DELETE FROM profiles;
  `);
  seedDatabase(targetDb);
}
