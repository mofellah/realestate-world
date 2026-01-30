import { Test, TestingModule } from '@nestjs/testing';
import { CorrelationIdMiddleware } from '../correlation-id.middleware';
import * as correlationIdUtil from '../../utils/correlation-id.util';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrelationIdMiddleware],
    }).compile();

    middleware = module.get<CorrelationIdMiddleware>(CorrelationIdMiddleware);
  });

  describe('use', () => {
    it('should use existing X-Correlation-ID from request header', () => {
      const existingId = 'existing-correlation-id';
      const req = {
        headers: {
          'x-correlation-id': existingId,
        },
      } as any;
      const res = {
        setHeader: jest.fn(),
      } as any;
      const next = jest.fn();

      jest.spyOn(correlationIdUtil, 'getOrGenerateCorrelationId').mockReturnValue(existingId);

      middleware.use(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-Id', existingId);
      expect(next).toHaveBeenCalled();
    });

    it('should generate new correlation ID if not in request header', () => {
      const req = {
        headers: {},
      } as any;
      const res = {
        setHeader: jest.fn(),
      } as any;
      const next = jest.fn();

      jest.spyOn(correlationIdUtil, 'getOrGenerateCorrelationId').mockReturnValue('generated-id');

      middleware.use(req, res, next);

      expect(correlationIdUtil.getOrGenerateCorrelationId).toHaveBeenCalledWith(req);
      expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-Id', 'generated-id');
      expect(next).toHaveBeenCalled();
    });

    it('should call next function', () => {
      const req = { headers: {} } as any;
      const res = { setHeader: jest.fn() } as any;
      const next = jest.fn();

      jest.spyOn(correlationIdUtil, 'getOrGenerateCorrelationId').mockReturnValue('test-id');

      middleware.use(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
