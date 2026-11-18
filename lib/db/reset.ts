import { getDb, resetDatabase } from './index';

console.log('Resetting and re-seeding Coy database...');
const db = getDb();
resetDatabase(db);
console.log('Successfully reset database!');
process.exit(0);
