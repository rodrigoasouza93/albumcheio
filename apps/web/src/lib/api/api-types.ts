export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AuthSession {
  readonly user: UserProfile;
  readonly session: {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly expiresIn: number;
    readonly tokenType: string;
  };
}

export interface AlbumSummary {
  readonly id: string;
  readonly name: string;
  readonly edition: string | null;
  readonly description: string | null;
  readonly status: string;
  readonly createdBy: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AlbumSectionSummary {
  readonly id: string;
  readonly albumId: string;
  readonly name: string;
  readonly code: string;
  readonly kind: 'tournament' | 'team' | 'custom';
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AlbumDetail extends AlbumSummary {
  readonly sections: readonly AlbumSectionSummary[];
}

export interface AlbumPage {
  readonly items: readonly AlbumSummary[];
  readonly limit: number;
  readonly offset: number;
}
