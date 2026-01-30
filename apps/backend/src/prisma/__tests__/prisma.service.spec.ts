import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    if (service) {
      await service.$disconnect();
    }
  });

  describe('onModuleInit', () => {
    it('should connect to database on module init', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database on module destroy', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('database connection', () => {
    it('should be an instance of PrismaClient', () => {
      expect(service).toBeDefined();
      expect(typeof service.$connect).toBe('function');
      expect(typeof service.$disconnect).toBe('function');
    });

    it('should have database models available', () => {
      expect(service.user).toBeDefined();
      expect(service.property).toBeDefined();
      expect(service.listing).toBeDefined();
      expect(service.message).toBeDefined();
      expect(service.agency).toBeDefined();
    });
  });
});
