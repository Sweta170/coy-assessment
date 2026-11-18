import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getFeed } from '@/lib/matching/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const feed = getFeed(db);

    return NextResponse.json(feed, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}
