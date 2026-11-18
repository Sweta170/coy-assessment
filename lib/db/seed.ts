import { getDb, seedDatabase } from './index';

console.log('Seeding Coy database...');
const db = getDb();
seedDatabase(db);
console.log('Successfully seeded database!');
process.exit(0);
