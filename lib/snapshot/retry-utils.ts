/**
 * Retry utilities with exponential backoff for snapshot tool
 */

import { delay, calculateBackoffDelay, withVercelTimeout, getEnvironmentTimeout } from './vercel-utils';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeout?: number;
  shouldRetry?: (error: any) => boolean;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  timeout: getEnvironmentTimeout(),
  shouldRetry: (error: any) => {
    // Retry on network errors, timeouts, and rate limits
    return (
      error.message?.includes('timeout') ||
      error.message?.includes('network') ||
      error.message?.includes('rate limit') ||
      error.message?.includes('429') ||
      error.message?.includes('500') ||
      error.message?.includes('502') ||
      error.message?.includes('503') ||
      error.message?.includes('504')
    );
  }
};

/**
 * Executes a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries!; attempt++) {
    try {
      // Wrap the function call with timeout
      return await withVercelTimeout(fn(), opts.timeout);
    } catch (error) {
      lastError = error;

      // Don't retry if we've reached max retries
      if (attempt === opts.maxRetries!) {
        break;
      }

      // Don't retry if the error is not retryable
      if (!opts.shouldRetry!(error)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        calculateBackoffDelay(attempt, opts.baseDelay!),
        opts.maxDelay!
      );

      console.log(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`, error.message);
      await delay(delayMs);
    }
  }

  throw lastError;
}

/**
 * Retries a function with custom retry logic
 */
export async function retryWithCustomLogic<T>(
  fn: () => Promise<T>,
  retryCondition: (error: any, attempt: number) => boolean,
  options: Omit<RetryOptions, 'shouldRetry'> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries!; attempt++) {
    try {
      return await withVercelTimeout(fn(), opts.timeout);
    } catch (error) {
      lastError = error;

      // Don't retry if we've reached max retries
      if (attempt === opts.maxRetries!) {
        break;
      }

      // Don't retry if custom condition says not to
      if (!retryCondition(error, attempt)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        calculateBackoffDelay(attempt, opts.baseDelay!),
        opts.maxDelay!
      );

      console.log(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`, error.message);
      await delay(delayMs);
    }
  }

  throw lastError;
}

/**
 * Retries with circuit breaker pattern
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 30000 // 30 seconds
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - too many failures');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

/**
 * Rate limiter to prevent too many requests
 */
export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    // If we're at the limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      
      if (waitTime > 0) {
        await delay(waitTime);
        return this.waitForSlot(); // Recursive call to check again
      }
    }

    // Add this request
    this.requests.push(now);
  }
}
