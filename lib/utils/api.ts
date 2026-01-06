export class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function errorResponse(error: APIError) {
  return Response.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    },
    { status: error.status }
  );
}

