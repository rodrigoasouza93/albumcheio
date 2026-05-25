export interface SupabaseUser {
  readonly id: string;
  readonly email?: string;
}

export interface SupabaseAuthSession {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
  readonly token_type: string;
}

export interface SupabaseAuthPayload {
  readonly user: SupabaseUser | null;
  readonly session?: SupabaseAuthSession | null;
  readonly access_token?: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
  readonly token_type?: string;
}

export interface SupabaseProfileRow {
  readonly id: string;
  readonly name: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface SupabaseAuthUserPayload {
  readonly user: SupabaseUser;
}
