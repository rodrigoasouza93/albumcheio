export class SupabaseApiError extends Error {
  public constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
  }
}
