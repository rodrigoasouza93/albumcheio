export type HealthStatus = 'ok';

export interface HealthResponse {
  readonly status: HealthStatus;
  readonly service: string;
}

export const createHealthResponse = (service: string): HealthResponse => ({
  status: 'ok',
  service
});
