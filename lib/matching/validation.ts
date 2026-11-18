import { z } from 'zod';

export const SwipeRequestSchema = z.object({
  targetId: z.string().min(1, 'Target ID is required'),
  direction: z.enum(['like', 'pass'], {
    errorMap: () => ({ message: 'Direction must be either "like" or "pass"' }),
  }),
});

export type SwipeRequest = z.infer<typeof SwipeRequestSchema>;

export type SwipeResponse =
  | { matched: true; profile: PublicProfile }
  | { matched: false };

export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  interests: string[];
}

export interface MatchItem extends PublicProfile {
  matchedAt: string;
}
