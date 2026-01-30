/**
 * AppService unit tests.
 */
import { AppService } from '../app.service';

describe('AppService', () => {
  it('should return hello message', () => {
    const service = new AppService();

    expect(service.getHello()).toBe(
      'Boilerplate Backend API - see /health or /api-docs for endpoints'
    );
  });
});
