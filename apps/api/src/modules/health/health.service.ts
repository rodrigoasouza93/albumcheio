import { Injectable } from '@nestjs/common';
import { createHealthResponse, type HealthResponse } from '@albumcheio/shared';

@Injectable()
export class HealthService {
  public getHealth(): HealthResponse {
    return createHealthResponse('api');
  }
}
