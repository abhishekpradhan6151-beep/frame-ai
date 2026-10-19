import { describe, it, expect, vi } from 'vitest';
import {
  isTransientError,
  extractRetryDelay,
  executeWithRetry,
  sanitizeError,
} from '../api/_lib/geminiService.js';

describe('Gemini Transient 503 UNAVAILABLE Error & Retry Handling', () => {
  describe('isTransientError classification', () => {
    it('identifies 503 high demand error as transient', () => {
      const error503 = {
        code: 503,
        status: 'UNAVAILABLE',
        message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
      };
      expect(isTransientError(error503)).toBe(true);
    });

    it('identifies 429 rate limit / resource exhausted error as transient', () => {
      const error429 = {
        status: 429,
        message: 'RESOURCE_EXHAUSTED: quota exceeded for model gemini-3.8-flash',
      };
      expect(isTransientError(error429)).toBe(true);
    });

    it('identifies 504 gateway timeout as transient', () => {
      const error504 = {
        status: 504,
        message: 'Gateway Timeout: upstream deadline exceeded',
      };
      expect(isTransientError(error504)).toBe(true);
    });

    it('identifies 400 invalid argument as non-retryable', () => {
      const error400 = {
        status: 400,
        message: 'INVALID_ARGUMENT: Schema validation failed for generation config',
      };
      expect(isTransientError(error400)).toBe(false);
    });

    it('identifies 401 / 403 API key or auth errors as non-retryable', () => {
      const error401 = {
        status: 401,
        message: 'API_KEY_INVALID: API key not valid. Please pass a valid API key.',
      };
      expect(isTransientError(error401)).toBe(false);

      const error403 = {
        status: 403,
        message: 'PERMISSION_DENIED: Gemini API has not been used in project',
      };
      expect(isTransientError(error403)).toBe(false);
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

    it('caps retry delay to safe maximum', () => {
      const err = { message: 'Please retry after 45s' };
      expect(extractRetryDelay(err)).toBe(5000);
    });
  });

  describe('executeWithRetry behavior', () => {
    it('Scenario 1: succeeds on first attempt without delay', async () => {
      const mockOp = vi.fn().mockResolvedValue({ text: '{"title":"Success Video"}' });

      const result = await executeWithRetry(mockOp, {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      expect(result).toEqual({ text: '{"title":"Success Video"}' });
      expect(mockOp).toHaveBeenCalledTimes(1);
    });

    it('Scenario 2: recovers after transient 503 failure and succeeds on retry', async () => {
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

    it('Scenario 3: exhausts retries on persistent 503 and returns safe user-friendly message', async () => {
      const persistentError = {
        code: 503,
        status: 'UNAVAILABLE',
        message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
      };

      const mockOp = vi.fn().mockRejectedValue(persistentError);

      await expect(
        executeWithRetry(mockOp, {
          maxRetries: 2,
          initialDelayMs: 10,
          maxDelayMs: 30,
        })
      ).rejects.toThrow('AI service is temporarily experiencing high demand. Please try again in a few moments.');

      // 1 initial attempt + 2 retries = 3 calls total
      expect(mockOp).toHaveBeenCalledTimes(3);
    });

    it('Scenario 4: fails immediately on non-retryable error without retrying', async () => {
      const nonRetryableError = {
        status: 400,
        message: 'INVALID_ARGUMENT: Invalid input provided to model',
      };

      const mockOp = vi.fn().mockRejectedValue(nonRetryableError);

      await expect(
        executeWithRetry(mockOp, {
          maxRetries: 3,
          initialDelayMs: 10,
        })
      ).rejects.toThrow('INVALID_ARGUMENT: Invalid input provided to model');

      // Must NOT retry 400 errors
      expect(mockOp).toHaveBeenCalledTimes(1);
    });

    it('Sanitization prevents key leakage even during errors', () => {
      const leakedKeyError = new Error('Request to https://generativelanguage.googleapis.com?key=AIzaSyA1234567890123456789012345678901 failed');
      const sanitized = sanitizeError(leakedKeyError);
      expect(sanitized).not.toContain('AIzaSyA1234567890123456789012345678901');
      expect(sanitized).toContain('[REDACTED]');
    });
  });
});
