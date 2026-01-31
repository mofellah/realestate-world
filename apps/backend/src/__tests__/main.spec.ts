/**
 * main.ts bootstrap tests.
 */
import type { INestApplication } from "@nestjs/common";

describe("main bootstrap", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const setupMocks = () => {
    const mockApp = {
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    } as unknown as INestApplication;

    jest.doMock("@nestjs/core", () => ({
      NestFactory: {
        create: jest.fn().mockResolvedValue(mockApp),
      },
    }));

    jest.doMock("@nestjs/swagger", () => {
      const builder = {
        setTitle: jest.fn().mockReturnThis(),
        setDescription: jest.fn().mockReturnThis(),
        setVersion: jest.fn().mockReturnThis(),
        addBearerAuth: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({}),
      };
      return {
        SwaggerModule: {
          createDocument: jest.fn().mockReturnValue({}),
          setup: jest.fn(),
        },
        DocumentBuilder: jest.fn().mockImplementation(() => builder),
        ApiProperty: jest.fn(() => () => undefined),
        ApiPropertyOptional: jest.fn(() => () => undefined),
        ApiOperation: jest.fn(() => () => undefined),
        ApiResponse: jest.fn(() => () => undefined),
        ApiBearerAuth: jest.fn(() => () => undefined),
        ApiTags: jest.fn(() => () => undefined),
        ApiQuery: jest.fn(() => () => undefined),
        ApiParam: jest.fn(() => () => undefined),
        PartialType: jest.fn((cls: any) => cls),
        PickType: jest.fn((cls: any) => cls),
        OmitType: jest.fn((cls: any) => cls),
      };
    });

    jest.doMock("@boilerplate/logger", () => ({
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
    }));

    return mockApp;
  };

  it("should bootstrap the app and listen on configured port", async () => {
    process.env.PORT = "4010";

    const mockApp = setupMocks();

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    await import("../main");

    await new Promise((resolve) => setImmediate(resolve));

    const { NestFactory } = await import("@nestjs/core");
    expect(NestFactory.create).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalledWith(4010, "0.0.0.0");

    consoleSpy.mockRestore();
  });

  it("should use default port and custom frontend URL", async () => {
    delete process.env.PORT;
    process.env.FRONTEND_URL = "http://example.com";

    const mockApp = setupMocks();
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    await import("../main");

    await new Promise((resolve) => setImmediate(resolve));

    expect(mockApp.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: expect.any(Function),
        credentials: true,
        methods: expect.arrayContaining(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]),
        allowedHeaders: expect.arrayContaining(["Content-Type", "Authorization"]),
      }),
    );
    expect(mockApp.listen).toHaveBeenCalledWith(3000, "0.0.0.0");

    consoleSpy.mockRestore();
  });
});
