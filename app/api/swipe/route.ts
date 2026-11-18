import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { processSwipe, MatchingError, TargetNotFoundError, SelfSwipeError } from '@/lib/matching/service';
import { SwipeRequestSchema } from '@/lib/matching/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const validation = SwipeRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          issues: validation.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { targetId, direction } = validation.data;
    const db = getDb();

    const result = processSwipe(db, targetId, direction);

    // Coy privacy guarantee:
    // If not matched, response is strictly { matched: false }
    // If matched, response is { matched: true, profile: publicProfile }
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    if (error instanceof TargetNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error instanceof SelfSwipeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof MatchingError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Unhandled swipe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
