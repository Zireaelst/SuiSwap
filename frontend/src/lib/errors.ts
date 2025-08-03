import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class ExternalApiError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} API error: ${message}`, 502, 'EXTERNAL_API_ERROR');
    this.name = 'ExternalApiError';
  }
}

export class TransactionError extends AppError {
  public txHash?: string;
  public gasUsed?: string;
  public revertReason?: string;

  constructor(message: string, txHash?: string, revertReason?: string) {
    super(message, 400, 'TRANSACTION_ERROR');
    this.name = 'TransactionError';
    this.txHash = txHash;
    this.revertReason = revertReason;
  }
}

// Global error handler for API routes
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

// Async error wrapper for API handlers
export function asyncHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Validation helper
export function validateRequired(data: Record<string, unknown>, fields: string[]): void {
  for (const field of fields) {
    if (!data[field]) {
      throw new ValidationError(`Field '${field}' is required`);
    }
  }
}

// Address validation
export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

// Amount validation
export function validateAmount(amount: string): boolean {
  try {
    const num = parseFloat(amount);
    return num > 0 && !isNaN(num);
  } catch {
    return false;
  }
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): void {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return;
  }

  if (record.count >= limit) {
    throw new RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((record.resetTime - now) / 1000)} seconds.`);
  }

  record.count++;
}

// Success response helper
export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

// CORS headers
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Request logging
export function logRequest(req: NextRequest): void {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
}
