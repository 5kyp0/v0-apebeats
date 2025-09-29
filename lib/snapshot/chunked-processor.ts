/**
 * Chunked processor for handling large snapshot operations
 * Breaks down work into smaller chunks to avoid Vercel timeouts
 */

import { chunkArray, withVercelTimeout, createProgressTracker, updateProgress, getElapsedTime, VERCEL_TIMEOUT_LIMIT } from './vercel-utils';
import { withRetry, CircuitBreaker, RateLimiter } from './retry-utils';

export interface ChunkedProcessorOptions {
  chunkSize?: number;
  maxConcurrency?: number;
  timeout?: number;
  onProgress?: (progress: number, current: string, elapsed: number) => void;
  onChunkComplete?: (chunkIndex: number, results: any[]) => void;
  onError?: (error: any, chunkIndex: number) => void;
}

export interface ProcessResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  chunkIndex: number;
  duration: number;
}

export class ChunkedProcessor<T, R> {
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;
  private options: Required<ChunkedProcessorOptions>;

  constructor(
    private processor: (chunk: T[]) => Promise<R[]>,
    options: ChunkedProcessorOptions = {}
  ) {
    this.options = {
      chunkSize: 3,
      maxConcurrency: 2,
      timeout: VERCEL_TIMEOUT_LIMIT,
      onProgress: () => {},
      onChunkComplete: () => {},
      onError: () => {},
      ...options
    };

    this.circuitBreaker = new CircuitBreaker(3, 10000); // 3 failures, 10s recovery
    this.rateLimiter = new RateLimiter(5, 1000); // 5 requests per second
  }

  /**
   * Processes data in chunks with progress tracking
   */
  async process(data: T[]): Promise<ProcessResult<R>[]> {
    const chunks = chunkArray(data, this.options.chunkSize);
    const results: ProcessResult<R>[] = [];
    const progressTracker = createProgressTracker(chunks.length);

    console.log(`Processing ${data.length} items in ${chunks.length} chunks of ${this.options.chunkSize}`);

    // Process chunks with limited concurrency
    const chunkPromises: Promise<ProcessResult<R>[]>[] = [];
    
    for (let i = 0; i < chunks.length; i += this.options.maxConcurrency) {
      const batch = chunks.slice(i, i + this.options.maxConcurrency);
      const batchPromises = batch.map((chunk, batchIndex) => 
        this.processChunk(chunk, i + batchIndex, progressTracker)
      );
      
      chunkPromises.push(Promise.all(batchPromises));
    }

    // Wait for all batches to complete
    const batchResults = await Promise.all(chunkPromises);
    
    // Flatten results
    for (const batchResult of batchResults) {
      results.push(...batchResult);
    }

    return results;
  }

  /**
   * Processes a single chunk with retry logic and circuit breaker
   */
  private async processChunk(
    chunk: T[],
    chunkIndex: number,
    progressTracker: any
  ): Promise<ProcessResult<R>[]> {
    const startTime = Date.now();
    
    try {
      // Wait for rate limiter slot
      await this.rateLimiter.waitForSlot();

      // Process chunk with circuit breaker and retry logic
      const results = await this.circuitBreaker.execute(async () => {
        return await withRetry(async () => {
          return await withVercelTimeout(
            this.processor(chunk),
            this.options.timeout
          );
        });
      });

      const duration = Date.now() - startTime;
      const progress = updateProgress(
        progressTracker,
        progressTracker.completed + 1,
        progressTracker.failed,
        `Completed chunk ${chunkIndex + 1}`
      );

      this.options.onProgress(progress, `Chunk ${chunkIndex + 1} completed`, getElapsedTime(progressTracker));
      this.options.onChunkComplete(chunkIndex, results);

      return results.map((result, index) => ({
        success: true,
        data: result,
        chunkIndex: chunkIndex * this.options.chunkSize + index,
        duration
      }));

    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`Chunk ${chunkIndex} failed:`, error);
      
      this.options.onError(error, chunkIndex);
      
      const progress = updateProgress(
        progressTracker,
        progressTracker.completed,
        progressTracker.failed + 1,
        `Failed chunk ${chunkIndex + 1}`
      );

      this.options.onProgress(progress, `Chunk ${chunkIndex + 1} failed`, getElapsedTime(progressTracker));

      // Return failed results for each item in the chunk
      return chunk.map((_, index) => ({
        success: false,
        error,
        chunkIndex: chunkIndex * this.options.chunkSize + index,
        duration
      }));
    }
  }
}

/**
 * Utility function to process contracts in chunks
 */
export async function processContractsInChunks<T, R>(
  contracts: T[],
  processor: (contract: T) => Promise<R>,
  options: ChunkedProcessorOptions = {}
): Promise<ProcessResult<R>[]> {
  const chunkedProcessor = new ChunkedProcessor(
    async (chunk: T[]) => {
      const results = await Promise.all(
        chunk.map(contract => processor(contract))
      );
      return results;
    },
    options
  );

  return await chunkedProcessor.process(contracts);
}

/**
 * Utility function to process with progress persistence
 */
export interface ProgressState {
  completed: number;
  failed: number;
  total: number;
  current: string;
  startTime: number;
  results: ProcessResult<any>[];
}

export class ProgressManager {
  private state: ProgressState;

  constructor(total: number) {
    this.state = {
      completed: 0,
      failed: 0,
      total,
      current: 'Starting...',
      startTime: Date.now(),
      results: []
    };
  }

  updateProgress(completed: number, failed: number, current: string, results: ProcessResult<any>[]): void {
    this.state.completed = completed;
    this.state.failed = failed;
    this.state.current = current;
    this.state.results = results;
  }

  getProgress(): ProgressState {
    return { ...this.state };
  }

  getCompletionPercentage(): number {
    return Math.round(((this.state.completed + this.state.failed) / this.state.total) * 100);
  }

  getElapsedTime(): number {
    return Math.round((Date.now() - this.state.startTime) / 1000);
  }

  isComplete(): boolean {
    return this.state.completed + this.state.failed >= this.state.total;
  }

  getSuccessRate(): number {
    const total = this.state.completed + this.state.failed;
    return total > 0 ? Math.round((this.state.completed / total) * 100) : 0;
  }
}
