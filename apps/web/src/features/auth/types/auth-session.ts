import type { UserProfile } from '@web/lib/api/api-types';

export interface StoredSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly tokenType: string;
  readonly user: UserProfile;
}
