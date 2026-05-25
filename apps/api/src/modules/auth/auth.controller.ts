import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { parseLoginInput, parseRegisterUserInput } from './auth.validation.js';
import { SupabaseAuthGuard } from './supabase-auth.guard.js';
import type {
  AuthSessionResponse,
  AuthenticatedUser,
  LogoutResponse
} from './auth.types.js';

interface AuthenticatedRequest {
  readonly user: AuthenticatedUser;
}

@Controller('auth')
export class AuthController {
  public constructor(
    @Inject(AuthService) private readonly authService: AuthService
  ) {}

  @Post('register')
  public register(@Body() body: unknown): Promise<AuthSessionResponse> {
    return this.authService.register(parseRegisterUserInput(body));
  }

  @Post('login')
  public login(@Body() body: unknown): Promise<AuthSessionResponse> {
    return this.authService.login(parseLoginInput(body));
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('logout')
  public logout(@Req() request: AuthenticatedRequest): Promise<LogoutResponse> {
    return this.authService.logout(request.user.accessToken);
  }
}
