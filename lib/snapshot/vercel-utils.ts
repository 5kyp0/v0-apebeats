/**
 * Vercel-compatible utilities for snapshot tool
 * Handles Vercel's 10-second serverless function timeout limit
 */

export const VERCEL_TIMEOUT_LIMIT = 8000; // 8 seconds (leaving 2s buffer)
export const CHUNK_SIZE = 3; // Process 3 contracts at a time
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second base delay

/**
 * Creates a timeout promise that rejects after the specified time
 */
export function createTimeoutPromise(timeoutMs: number = VERCEL_TIMEOUT_LIMIT): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
}

/**
 * Wraps a promise with Vercel-compatible timeout
 */
export async function withVercelTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = VERCEL_TIMEOUT_LIMIT
): Promise<T> {
  return Promise.race([promise, createTimeoutPromise(timeoutMs)]);
}

/**
 * Chunks an array into smaller arrays for processing
 */
export function chunkArray<T>(array: T[], chunkSize: number = CHUNK_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Creates a delay promise for retry logic
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculates exponential backoff delay
 */
export function calculateBackoffDelay(attempt: number, baseDelay: number = RETRY_DELAY): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
}

/**
 * Checks if we're running on Vercel
 */
export function isVercelEnvironment(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

/**
 * Gets appropriate timeout based on environment
 */
export function getEnvironmentTimeout(): number {
  return isVercelEnvironment() ? VERCEL_TIMEOUT_LIMIT : 30000; // 30s for local dev
}

/**
 * Creates a progress tracking object
 */
export interface ProgressTracker {
  total: number;
  completed: number;
  failed: number;
  current: string;
  startTime: number;
}

export function createProgressTracker(total: number): ProgressTracker {
  return {
    total,
    completed: 0,
    failed: 0,
    current: '',
    startTime: Date.now()
  };
}

/**
 * Updates progress and returns completion percentage
 */
export function updateProgress(tracker: ProgressTracker, completed: number, failed: number, current: string): number {
  tracker.completed = completed;
  tracker.failed = failed;
  tracker.current = current;
  return Math.round(((completed + failed) / tracker.total) * 100);
}

/**
 * Gets elapsed time in seconds
 */
export function getElapsedTime(tracker: ProgressTracker): number {
  return Math.round((Date.now() - tracker.startTime) / 1000);
}
