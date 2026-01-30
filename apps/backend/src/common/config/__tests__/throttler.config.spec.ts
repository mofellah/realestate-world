/**
 * Tests for throttler config utilities.
 */

import { shouldSkipThrottler, throttlerConfig } from '../throttler.config';

describe('throttlerConfig', () => {
  it('defines default, strict, and search rules', () => {
    const config = throttlerConfig as ReadonlyArray<{ name: string; limit: number }>;
    const names = config.map((rule) => rule.name);

    expect(names).toEqual(['default', 'strict', 'search']);
    expect(config[0].limit).toBe(100);
    expect(config[1].limit).toBe(5);
    expect(config[2].limit).toBe(30);
  });
});

describe('shouldSkipThrottler', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('skips throttling for /health', () => {
    const req = { path: '/health' };

    expect(shouldSkipThrottler(req)).toBe(true);
  });

  it('skips throttling for /metrics', () => {
    const req = { path: '/metrics' };

    expect(shouldSkipThrottler(req)).toBe(true);
  });

  it('skips throttling for admin users in development', () => {
    process.env.NODE_ENV = 'development';

    const req = { path: '/anything', user: { role: 'admin' } };

    expect(shouldSkipThrottler(req)).toBe(true);
  });

  it('does not skip throttling for other requests', () => {
    process.env.NODE_ENV = 'production';

    const req = { path: '/anything', user: { role: 'admin' } };

    expect(shouldSkipThrottler(req)).toBe(false);
  });
});
