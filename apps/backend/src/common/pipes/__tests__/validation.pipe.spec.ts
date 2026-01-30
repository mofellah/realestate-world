import { ValidationPipe } from '../validation.pipe';
import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

describe('ValidationPipe', () => {
  describe('transform', () => {
    it('should return value if validation passes', async () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });
      const pipe = new ValidationPipe(schema);
      const value = { email: 'test@example.com', password: 'Password123' };

      const result = pipe.transform(value, { type: 'body', metatype: Object });

      expect(result).toEqual(value);
    });

    it('should throw BadRequestException if validation fails', async () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });
      const pipe = new ValidationPipe(schema);
      const value = { email: 'invalid', password: '123' };

      expect(() => pipe.transform(value, { type: 'body', metatype: Object })).toThrow(
        BadRequestException
      );
    });

    it('should skip validation if no schema provided', () => {
      const pipe = new ValidationPipe();
      const value = { test: 'data' };

      const result = pipe.transform(value, { type: 'body', metatype: Object });

      expect(result).toEqual(value);
    });

    it('should skip validation for non-body metadata', () => {
      const schema = z.object({
        email: z.string().email(),
      });
      const pipe = new ValidationPipe(schema);
      const value = 'test-query';

      const result = pipe.transform(value, { type: 'query', metatype: String });

      expect(result).toBe(value);
    });

    it('should include field and message in error details', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });
      const pipe = new ValidationPipe(schema);
      const value = { email: 'invalid', age: 10 };

      try {
        pipe.transform(value, { type: 'body', metatype: Object });
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toHaveProperty('message', 'Validation failed');
        expect(error.getResponse()).toHaveProperty('details');
        expect(Array.isArray(error.getResponse().details)).toBe(true);
      }
    });
  });
});
