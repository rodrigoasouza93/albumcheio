export interface RegisterUserInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string | null;
  readonly name: string | null;
  readonly accessToken: string;
}

export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AuthSessionResponse {
  readonly user: UserProfile;
  readonly session: {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly expiresIn: number;
    readonly tokenType: string;
  };
}

export interface LogoutResponse {
  readonly success: true;
}
