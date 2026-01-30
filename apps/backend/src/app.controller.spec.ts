import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return welcome message', () => {
      const result = controller.getHello();
      expect(result).toEqual({
        message: 'Welcome to RealEstate World API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          docs: '/api/docs',
          auth: '/auth',
          properties: '/properties',
          listings: '/listings',
          agencies: '/agencies',
          messages: '/messages',
          users: '/users',
        },
      });
    });
  });

  describe('getStatus', () => {
    it('should return API status', () => {
      const result = controller.getStatus();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.uptime).toBe('number');
    });
  });
});
