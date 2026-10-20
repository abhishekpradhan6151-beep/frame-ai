import { describe, it, expect, vi } from 'vitest';
import {
  isTransientError,
  extractRetryDelay,
  executeWithRetry,
  sanitizeError,
  categorizeGeminiError,
  GeminiServiceError,
} from '../api/_lib/geminiService.js';

describe('Gemini Production Error Handling & Status Preservation', () => {
  describe('categorizeGeminiError & Status Mapping', () => {
    it('Scenario: maps 503 UNAVAILABLE to HTTP 503 with temporary service unavailable message', () => {
      const err = {
        code: 503,
        status: 'UNAVAILABLE',
        message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
      };
      const cat = categorizeGeminiError(err);
      expect(cat.statusCode).toBe(503);
      expect(cat.category).toBe('SERVICE_UNAVAILABLE');
      expect(cat.message).toBe('AI service is temporarily experiencing high demand. Please try again in a few moments.');
    });

    it('Scenario: maps 429 to HTTP 429 with rate-limit message and does NOT claim daily quota is exhausted', () => {
      const err = {
        status: 429,
        message: 'RESOURCE_EXHAUSTED: Rate limit exceeded for requests per minute',
      };
      const cat = categorizeGeminiError(err);
      expect(cat.statusCode).toBe(429);
      expect(cat.category).toBe('RATE_LIMIT');
      expect(cat.message).toBe('AI request rate limit reached. Please wait a moment before trying again.');
      expect(cat.message).not.toContain('daily quota is exhausted');
      expect(cat.message).not.toContain('Daily AI generation quota');
    });

    it('Scenario: maps 429 token limit error accurately without generic message', () => {
      const err = {
        status: 429,
        message: 'RESOURCE_EXHAUSTED: Quota exceeded for input tokens per minute (TPM)',
      };
      const cat = categorizeGeminiError(err);
      expect(cat.statusCode).toBe(429);
      expect(cat.category).toBe('RATE_LIMIT');
      expect(cat.message).toBe('AI token rate limit reached. Please shorten your idea or creative instructions and try again.');
    });

    it('Scenario: maps 429 daily quota error accurately', () => {
      const err = {
        status: 429,
        message: 'RESOURCE_EXHAUSTED: Online prediction requests per day quota exceeded',
      };
      const cat = categorizeGeminiError(err);
      expect(cat.statusCode).toBe(429);
      expect(cat.category).toBe('RATE_LIMIT');
      expect(cat.message).toContain('Daily AI generation quota reached');
    });

    it('Scenario: maps 429 with server retry delay accurately', () => {
      const err = {
        status: 429,
        message: 'RESOURCE_EXHAUSTED: Please retry after 15s',
      };
      const cat = categorizeGeminiError(err);
      expect(cat.statusCode).toBe(429);
      expect(cat.category).toBe('RATE_LIMIT');
      expect(cat.message).toContain('15 seconds');
      expect(cat.retryAfterSeconds).toBe(15);
    });

    it('Scenario: maps 504 DEADLINE_EXCEEDED to HTTP 504 with timeout message', () => {
      const err = {
        status: 504,
        message: 'Gateway Timeout: deadline exceeded while waiting for model completion',
      };
      const cat = categorizeGeminiError(err);
      expect(cat.statusCode).toBe(504);
      expect(cat.category).toBe('TIMEOUT');
      expect(cat.message).toBe('The AI service timed out while generating your video framework. Please try again.');
    });

    it('Scenario: maps 401 / 403 / PERMISSION_DENIED to HTTP 401 with configuration error and zero key exposure', () => {
      const err = {
        status: 403,
        message: 'PERMISSION_DENIED: API key not valid. Please pass a valid API key with key=AIzaSyA1234567890123456789012345678901',
      };
      const cat = categorizeGeminiError(err);
      expect(cat.statusCode).toBe(401);
      expect(cat.category).toBe('AUTH_ERROR');
      expect(cat.message).toBe('Gemini API key is invalid or not properly configured on the server.');
      expect(cat.message).not.toMatch(/AIza[0-9A-Za-z-_]{35}/);
    });

    it('Scenario: maps 400 INVALID_ARGUMENT to HTTP 400', () => {
      const err = {
        status: 400,
        message: 'INVALID_ARGUMENT: Schema validation failed',
      };
      const cat = categorizeGeminiError(err);
      expect(cat.statusCode).toBe(400);
      expect(cat.category).toBe('INVALID_REQUEST');
      expect(cat.message).toContain('Invalid generation request:');
    });
  });

  describe('isTransientError classification & Non-blind 429 retries', () => {
    it('identifies 503 high demand error as transient and retryable', () => {
      const error503 = {
        code: 503,
        status: 'UNAVAILABLE',
        message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
      };
      expect(isTransientError(error503)).toBe(true);
    });

    it('does NOT retry 429 blindly when no short server retry delay is provided', () => {
      const error429 = {
        status: 429,
        message: 'RESOURCE_EXHAUSTED: rate limit exceeded',
      };
      // Without short retry delay, 429 is not blindly retried within function lifecycle
      expect(isTransientError(error429)).toBe(false);
    });

    it('identifies 429 as retryable ONLY when server explicitly provides a short retry delay (<= 5s)', () => {
      const error429WithShortDelay = {
        status: 429,
        message: 'RESOURCE_EXHAUSTED: Please retry after 2s',
      };
      expect(isTransientError(error429WithShortDelay)).toBe(true);
    });

    it('does NOT retry 429 when server delay is large (> 5s)', () => {
      const error429WithLongDelay = {
        status: 429,
        message: 'RESOURCE_EXHAUSTED: Please retry after 45s',
      };
      expect(isTransientError(error429WithLongDelay)).toBe(false);
    });

    it('identifies 504 timeout error as transient', () => {
      const error504 = {
        status: 504,
        message: 'Gateway Timeout: deadline exceeded',
      };
      expect(isTransientError(error504)).toBe(true);
    });

    it('identifies 400 invalid argument as non-retryable', () => {
      expect(isTransientError({ status: 400, message: 'Bad Request' })).toBe(false);
    });

    it('identifies 401 / 403 API key or auth errors as non-retryable', () => {
      expect(isTransientError({ status: 401, message: 'Invalid API Key' })).toBe(false);
      expect(isTransientError({ status: 403, message: 'Permission Denied' })).toBe(false);
    });
  });

  describe('extractRetryDelay', () => {
    it('extracts retry delay from error message', () => {
      const err = { message: 'Please retry after 2.5s' };
      expect(extractRetryDelay(err)).toBe(2500);
    });

    it('extracts retry delay from response headers', () => {
      const err = {
        response: {
          headers: {
            get: (h: string) => (h === 'retry-after' ? '3' : null),
          },
        },
      };
      expect(extractRetryDelay(err)).toBe(3000);
    });

    it('extracts retry delay from Google RPC details object', () => {
      const err = {
        error: {
          details: [
            {
              '@type': 'type.googleapis.com/google.rpc.RetryInfo',
              retryDelay: '4s',
            },
          ],
        },
      };
      expect(extractRetryDelay(err)).toBe(4000);
    });
  });

  describe('executeWithRetry behavior & HTTP status propagation', () => {
    it('Requirement 7.1: Successful generation on first attempt', async () => {
      const mockOp = vi.fn().mockResolvedValue({ text: '{"title":"Success Video"}' });

      const result = await executeWithRetry(mockOp, {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(result).toEqual({ text: '{"title":"Success Video"}' });
      expect(mockOp).toHaveBeenCalledTimes(1);
    });

    it('Requirement 7.2: 503 followed by successful generation', async () => {
      const transientError = {
        code: 503,
        status: 'UNAVAILABLE',
        message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
      };

      const mockOp = vi
        .fn()
        .mockRejectedValueOnce(transientError)
        .mockResolvedValueOnce({ text: '{"title":"Recovered Video"}' });

      const result = await executeWithRetry(mockOp, {
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 50,
      });

      expect(result).toEqual({ text: '{"title":"Recovered Video"}' });
      expect(mockOp).toHaveBeenCalledTimes(2);
    });

    it('Requirement 7.3: Persistent 503 after bounded retries preserves HTTP 503 status', async () => {
      const persistentError = {
        code: 503,
        status: 'UNAVAILABLE',
        message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
      };

      const mockOp = vi.fn().mockRejectedValue(persistentError);

      try {
        await executeWithRetry(mockOp, {
          maxRetries: 2,
          initialDelayMs: 10,
          maxDelayMs: 30,
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(GeminiServiceError);
        expect(err.statusCode).toBe(503);
        expect(err.category).toBe('SERVICE_UNAVAILABLE');
        expect(err.message).toBe('AI service is temporarily experiencing high demand. Please try again in a few moments.');
        expect(mockOp).toHaveBeenCalledTimes(3);
      }
    });

    it('Requirement 7.4: 429 without server retry delay fails immediately on attempt 1 without rapid blind retrying', async () => {
      const rateLimitError = {
        status: 429,
        statusText: 'Too Many Requests',
        message: 'RESOURCE_EXHAUSTED: rate limit exceeded',
      };

      const mockOp = vi.fn().mockRejectedValue(rateLimitError);

      try {
        await executeWithRetry(mockOp, {
          maxRetries: 2,
          initialDelayMs: 10,
          maxDelayMs: 30,
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(GeminiServiceError);
        expect(err.statusCode).toBe(429);
        expect(err.category).toBe('RATE_LIMIT');
        expect(err.message).toBe('AI request rate limit reached. Please wait a moment before trying again.');
        expect(err.message).not.toContain('daily quota');
        // Crucial: NOT retried blindly
        expect(mockOp).toHaveBeenCalledTimes(1);
      }
    });

    it('Requirement 7.4b: 429 with short server retry delay (<= 5s) retries once respecting server delay', async () => {
      const rateLimitWithDelay = {
        status: 429,
        message: 'RESOURCE_EXHAUSTED: Rate limit exceeded. Please retry after 1s',
      };

      const mockOp = vi
        .fn()
        .mockRejectedValueOnce(rateLimitWithDelay)
        .mockResolvedValueOnce({ text: '{"title":"Recovered After Rate Limit"}' });

      const result = await executeWithRetry(mockOp, {
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 2000,
      });

      expect(result).toEqual({ text: '{"title":"Recovered After Rate Limit"}' });
      expect(mockOp).toHaveBeenCalledTimes(2);
    });

    it('Requirement 7.5: 504 timeout preserves HTTP 504 status', async () => {
      const timeoutError = {
        status: 504,
        message: 'Gateway Timeout: deadline exceeded',
      };

      const mockOp = vi.fn().mockRejectedValue(timeoutError);

      try {
        await executeWithRetry(mockOp, {
          maxRetries: 1,
          initialDelayMs: 10,
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(GeminiServiceError);
        expect(err.statusCode).toBe(504);
        expect(err.category).toBe('TIMEOUT');
        expect(err.message).toBe('The AI service timed out while generating your video framework. Please try again.');
      }
    });

    it('Requirement 7.6: Invalid API key or permanent 4xx error fails on first attempt without retrying', async () => {
      const authError = {
        status: 401,
        message: 'API_KEY_INVALID: API key not valid.',
      };

      const mockOp = vi.fn().mockRejectedValue(authError);

      try {
        await executeWithRetry(mockOp, {
          maxRetries: 3,
          initialDelayMs: 10,
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(GeminiServiceError);
        expect(err.statusCode).toBe(401);
        expect(err.category).toBe('AUTH_ERROR');
        expect(mockOp).toHaveBeenCalledTimes(1);
      }
    });

    it('Requirement 7.7: Sanitization prevents key leakage even during errors', () => {
      const leakedKeyError = new Error('Request to https://generativelanguage.googleapis.com?key=AIzaSyA1234567890123456789012345678901 failed');
      const sanitized = sanitizeError(leakedKeyError);
      expect(sanitized).not.toContain('AIzaSyA1234567890123456789012345678901');
      expect(sanitized).toContain('[REDACTED]');
    });
  });
});
