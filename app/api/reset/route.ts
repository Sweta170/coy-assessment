import { NextResponse } from 'next/server';
import { getDb, resetDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getDb();
    resetDatabase(db);
    return NextResponse.json({ success: true, message: 'Database reset successfully' });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
