import { NextResponse } from "next/server";
import { ZodError, z, type ZodIssue } from "zod";

/**
 * Standard API error response format
 */
export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: unknown
): NextResponse<ApiError> {
  const errorType = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
  }[status] || "Error";

  return NextResponse.json(
    {
      error: errorType,
      message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

/**
 * Creates a standardized success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Validates request data against a Zod schema
 * Returns validated data or throws an error response
 */
export async function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): Promise<z.infer<T>> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map((e: ZodIssue) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw errorResponse(
        "Validation failed",
        400,
        fieldErrors
      );
    }
    throw errorResponse("Invalid request data", 400);
  }
}

/**
 * Validates query parameters from URL
 */
export async function validateQuery<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams
): Promise<z.infer<T>> {
  const params = Object.fromEntries(searchParams.entries());
  return validateRequest(schema, params);
}

/**
 * Validates JSON request body
 */
export async function validateBody<T extends z.ZodType>(
  schema: T,
  request: Request
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return validateRequest(schema, body);
  } catch (error) {
    if (error instanceof NextResponse) {
      throw error;
    }
    throw errorResponse("Invalid JSON body", 400);
  }
}

/**
 * Wraps an API route handler with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      // If it's already a NextResponse (from our error helpers), return it
      if (error instanceof NextResponse) {
        return error;
      }

      // Log the error for debugging
      console.error("API Error:", error);

      // Return generic error response
      return errorResponse(
        error instanceof Error ? error.message : "An unexpected error occurred",
        500
      );
    }
  }) as T;
}
